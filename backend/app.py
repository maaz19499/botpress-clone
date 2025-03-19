from fastapi import FastAPI, HTTPException, Depends, Body, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional, Any, Union
import uuid
import datetime
import json
import os
import shutil
from sqlalchemy import create_engine, Column, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

from langchain_processor import KnowledgeBaseProcessor, ChatProcessor
from document_processor import process_document, process_website

# Database setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./botbuilder.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("knowledge_bases", exist_ok=True)

# Models
class Bot(Base):
    __tablename__ = "bots"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    system_prompt = Column(Text, nullable=True)
    theme = Column(Text, nullable=True)  # JSON string of theme settings
    
    knowledge_sources = relationship("KnowledgeSource", back_populates="bot")
    messages = relationship("Message", back_populates="bot")

class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"
    
    id = Column(String, primary_key=True, index=True)
    bot_id = Column(String, ForeignKey("bots.id"))
    name = Column(String)
    source_type = Column(String)  # 'file' or 'website'
    url = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    status = Column(String)  # 'processing', 'ready', 'error'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    bot = relationship("Bot", back_populates="knowledge_sources")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, index=True)
    bot_id = Column(String, ForeignKey("bots.id"))
    content = Column(Text)
    sender = Column(String)  # 'user' or 'bot'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    bot = relationship("Bot", back_populates="messages")

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class BotCreate(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None

class BotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    theme: Optional[Dict[str, Any]] = None

class ThemeSettings(BaseModel):
    primaryColor: str
    backgroundColor: str
    textColor: str
    fontFamily: str
    borderRadius: str
    headerColor: str

class BotResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    theme: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    
    class Config:
        orm_mode = True

class KnowledgeSourceCreate(BaseModel):
    name: str
    source_type: str
    url: Optional[str] = None

class KnowledgeSourceResponse(BaseModel):
    id: str
    bot_id: str
    name: str
    source_type: str
    url: Optional[str] = None
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    
    class Config:
        orm_mode = True

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, Any]] = []

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, str]] = []
    timestamp: datetime.datetime

# FastAPI app
app = FastAPI(title="PyBotBuilder API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bot endpoints
@app.post("/api/bots", response_model=BotResponse)
def create_bot(bot: BotCreate, db: Session = Depends(get_db)):
    bot_id = str(uuid.uuid4())
    
    # Create bot directory for knowledge base
    os.makedirs(f"knowledge_bases/{bot_id}", exist_ok=True)
    
    db_bot = Bot(
        id=bot_id,
        name=bot.name,
        description=bot.description,
        system_prompt=bot.system_prompt or "You are a helpful assistant that answers questions based on the provided knowledge base."
    )
    db.add(db_bot)
    db.commit()
    db.refresh(db_bot)
    
    # Initialize knowledge base processor
    KnowledgeBaseProcessor.initialize_for_bot(bot_id)
    
    return db_bot

@app.get("/api/bots", response_model=List[BotResponse])
def get_bots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bots = db.query(Bot).offset(skip).limit(limit).all()
    
    # Parse theme JSON for each bot
    for bot in bots:
        if bot.theme:
            bot.theme = json.loads(bot.theme)
    
    return bots

@app.get("/api/bots/{bot_id}", response_model=BotResponse)
def get_bot(bot_id: str, db: Session = Depends(get_db)):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    # Parse theme JSON
    if db_bot.theme:
        db_bot.theme = json.loads(db_bot.theme)
    
    return db_bot

@app.put("/api/bots/{bot_id}", response_model=BotResponse)
def update_bot(bot_id: str, bot: BotUpdate, db: Session = Depends(get_db)):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    update_data = bot.dict(exclude_unset=True)
    
    # Convert theme to JSON string if provided
    if "theme" in update_data:
        update_data["theme"] = json.dumps(update_data["theme"])
    
    for key, value in update_data.items():
        setattr(db_bot, key, value)
    
    db_bot.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_bot)
    
    # Parse theme JSON for response
    if db_bot.theme:
        db_bot.theme = json.loads(db_bot.theme)
    
    return db_bot

@app.delete("/api/bots/{bot_id}")
def delete_bot(bot_id: str, db: Session = Depends(get_db)):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    # Delete knowledge sources
    db.query(KnowledgeSource).filter(KnowledgeSource.bot_id == bot_id).delete()
    
    # Delete messages
    db.query(Message).filter(Message.bot_id == bot_id).delete()
    
    # Delete bot
    db.delete(db_bot)
    db.commit()
    
    # Delete knowledge base directory
    kb_dir = f"knowledge_bases/{bot_id}"
    if os.path.exists(kb_dir):
        shutil.rmtree(kb_dir)
    
    return {"detail": "Bot deleted successfully"}

# Knowledge base endpoints
@app.post("/api/bots/{bot_id}/knowledge/files", response_model=KnowledgeSourceResponse)
async def upload_file(
    bot_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    # Check file extension
    allowed_extensions = ['.pdf', '.docx', '.txt', '.csv']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}")
    
    # Create unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = f"uploads/{unique_filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create knowledge source
    source_id = str(uuid.uuid4())
    db_source = KnowledgeSource(
        id=source_id,
        bot_id=bot_id,
        name=file.filename,
        source_type="file",
        file_path=file_path,
        status="processing"
    )
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    
    # Process document in background (in a real app, this would be a background task)
    try:
        # Process the document and add to knowledge base
        process_document(file_path, bot_id, source_id)
        
        # Update status to ready
        db_source.status = "ready"
        db_source.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_source)
    except Exception as e:
        db_source.status = "error"
        db.commit()
        print(f"Error processing document: {e}")
    
    return db_source

@app.post("/api/bots/{bot_id}/knowledge/websites", response_model=KnowledgeSourceResponse)
async def add_website(
    bot_id: str,
    source: KnowledgeSourceCreate,
    db: Session = Depends(get_db)
):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    if source.source_type != "website" or not source.url:
        raise HTTPException(status_code=400, detail="Invalid source type or missing URL")
    
    # Create knowledge source
    source_id = str(uuid.uuid4())
    db_source = KnowledgeSource(
        id=source_id,
        bot_id=bot_id,
        name=source.url,
        source_type="website",
        url=source.url,
        status="processing"
    )
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    
    # Process website in background (in a real app, this would be a background task)
    try:
        # Process the website and add to knowledge base
        process_website(source.url, bot_id, source_id)
        
        # Update status to ready
        db_source.status = "ready"
        db_source.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_source)
    except Exception as e:
        db_source.status = "error"
        db.commit()
        print(f"Error processing website: {e}")
    
    return db_source

@app.get("/api/bots/{bot_id}/knowledge", response_model=List[KnowledgeSourceResponse])
def get_knowledge_sources(bot_id: str, db: Session = Depends(get_db)):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    sources = db.query(KnowledgeSource).filter(KnowledgeSource.bot_id == bot_id).all()
    return sources

@app.delete("/api/bots/{bot_id}/knowledge/{source_id}")
def delete_knowledge_source(bot_id: str, source_id: str, db: Session = Depends(get_db)):
    db_source = db.query(KnowledgeSource).filter(
        KnowledgeSource.id == source_id,
        KnowledgeSource.bot_id == bot_id
    ).first()
    
    if db_source is None:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    # Delete file if it exists
    if db_source.file_path and os.path.exists(db_source.file_path):
        os.remove(db_source.file_path)
    
    # Remove from knowledge base
    KnowledgeBaseProcessor.remove_source(bot_id, source_id)
    
    # Delete from database
    db.delete(db_source)
    db.commit()
    
    return {"detail": "Knowledge source deleted successfully"}

# Chat endpoint
@app.post("/api/chat/{bot_id}", response_model=ChatResponse)
async def chat_with_bot(
    bot_id: str, 
    chat_request: ChatRequest = Body(...),
    db: Session = Depends(get_db)
):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    # Get system prompt
    system_prompt = db_bot.system_prompt or "You are a helpful assistant that answers questions based on the provided knowledge base."
    
    # Save user message
    user_message = Message(
        id=str(uuid.uuid4()),
        bot_id=bot_id,
        content=chat_request.message,
        sender="user"
    )
    db.add(user_message)
    db.commit()
    
    # Process the chat request using LangChain
    chat_processor = ChatProcessor(bot_id)
    response_text, sources = chat_processor.process_message(
        chat_request.message,
        chat_request.conversation_history,
        system_prompt
    )
    
    # Save bot response
    bot_message = Message(
        id=str(uuid.uuid4()),
        bot_id=bot_id,
        content=response_text,
        sender="bot"
    )
    db.add(bot_message)
    db.commit()
    
    return {
        "response": response_text,
        "sources": sources,
        "timestamp": datetime.datetime.utcnow()
    }

# Embed code endpoints
@app.get("/api/chatbot/{bot_id}/embed.js")
async def get_embed_js(bot_id: str, db: Session = Depends(get_db)):
    db_bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if db_bot is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    # In a real implementation, this would serve the actual JavaScript file
    # For this example, we'll return a simple script
    js_content = """
    (function() {
        window.PyBotBuilder = {
            init: function(config) {
                const botId = config.botId;
                const mode = config.mode || 'inline';
                const theme = config.theme || {};
                const botName = config.botName || 'AI Assistant';
                
                if (mode === 'inline') {
                    const container = document.getElementById(config.containerId);
                    if (!container) {
                        console.error('PyBotBuilder: Container element not found');
                        return;
                    }
                    
                    this.createChatInterface(container, botId, theme, botName);
                } else if (mode === 'popup') {
                    this.createPopupWidget(botId, theme, botName);
                }
            },
            
            createChatInterface: function(container, botId, theme, botName) {
                // Create chat interface HTML
                container.innerHTML = `
                    <div class="pybot-chat" style="
                        font-family: ${theme.fontFamily || 'sans-serif'};
                        border-radius: ${theme.borderRadius || '8px'};
                        overflow: hidden;
                        border: 1px solid #e2e8f0;
                        height: 500px;
                        display: flex;
                        flex-direction: column;
                    ">
                        <div class="pybot-header" style="
                            background-color: ${theme.headerColor || '#f8fafc'};
                            color: ${theme.textColor || '#000000'};
                            padding: 12px;
                            border-bottom: 1px solid #e2e8f0;
                            display: flex;
                            align-items: center;
                        ">
                            <div class="pybot-avatar" style="
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                background-color: #cbd5e1;
                                margin-right: 8px;
                            "></div>
                            <div>
                                <div style="font-weight: 500;">${botName}</div>
                                <div style="font-size: 12px; opacity: 0.7;">Online</div>
                            </div>
                        </div>
                        <div class="pybot-messages" style="
                            flex: 1;
                            overflow-y: auto;
                            padding: 16px;
                            background-color: ${theme.backgroundColor || '#ffffff'};
                            color: ${theme.textColor || '#000000'};
                        ">
                            <div class="pybot-message bot" style="
                                display: flex;
                                margin-bottom: 16px;
                            ">
                                <div style="
                                    background-color: #f1f5f9;
                                    padding: 12px;
                                    border-radius: ${theme.borderRadius ? `calc(${theme.borderRadius} - 2px)` : '6px'};
                                    max-width: 80%;
                                ">
                                    <div style="font-size: 14px;">Hello! How can I help you today?</div>
                                    <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        </div>
                        <div class="pybot-input" style="
                            padding: 12px;
                            border-top: 1px solid #e2e8f0;
                            background-color: ${theme.backgroundColor || '#ffffff'};
                        ">
                            <form class="pybot-form" style="
                                display: flex;
                                gap: 8px;
                            ">
                                <input type="text" class="pybot-input-field" placeholder="Type a message..." style="
                                    flex: 1;
                                    padding: 8px 12px;
                                    border: 1px solid #e2e8f0;
                                    border-radius: ${theme.borderRadius ? `calc(${theme.borderRadius} - 2px)` : '6px'};
                                    font-size: 14px;
                                ">
                                <button type="submit" class="pybot-send-button" style="
                                    background-color: ${theme.primaryColor || '#0ea5e9'};
                                    color: white;
                                    border: none;
                                    border-radius: ${theme.borderRadius ? `calc(${theme.borderRadius} - 2px)` : '6px'};
                                    width: 36px;
                                    height: 36px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                ">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                `;
                
                // Add event listeners
                const form = container.querySelector('.pybot-form');
                const input = container.querySelector('.pybot-input-field');
                const messagesContainer = container.querySelector('.pybot-messages');
                
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const message = input.value.trim();
                    if (!message) return;
                    
                    // Add user message
                    this.addMessage(messagesContainer, message, 'user', theme);
                    input.value = '';
                    
                    // Simulate bot response
                    this.simulateBotResponse(messagesContainer, message, botId, theme);
                }.bind(this));
            },
            
            createPopupWidget: function(botId, theme, botName) {
                // Create button element
                const button = document.createElement('div');
                button.className = 'pybot-widget-button';
                button.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background-color: ${theme.primaryColor || '#0ea5e9'};
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                `;
                
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                `;
                
                // Create chat container
                const chatContainer = document.createElement('div');
                chatContainer.className = 'pybot-popup-container';
                chatContainer.style.cssText = `
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 350px;
                    height: 500px;
                    border-radius: ${theme.borderRadius || '8px'};
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    display: none;
                `;
                
                document.body.appendChild(button);
                document.body.appendChild(chatContainer);
                
                // Toggle chat on button click
                button.addEventListener('click', function() {
                    if (chatContainer.style.display === 'none') {
                        chatContainer.style.display = 'block';
                        if (!chatContainer.hasChildNodes()) {
                            this.createChatInterface(chatContainer, botId, theme, botName);
                        }
                    } else {
                        chatContainer.style.display = 'none';
                    }
                }.bind(this));
            },
            
            addMessage: function(container, text, sender, theme) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `pybot-message ${sender}`;
                messageDiv.style.cssText = `
                    display: flex;
                    margin-bottom: 16px;
                    ${sender === 'user' ? 'justify-content: flex-end;' : ''}
                `;
                
                const messageContent = document.createElement('div');
                messageContent.style.cssText = `
                    ${sender === 'user' 
                        ? `background-color: ${theme.primaryColor || '#0ea5e9'}; color: white;` 
                        : 'background-color: #f1f5f9; color: #1e293b;'}
                    padding: 12px;
                    border-radius: ${theme.borderRadius ? `calc(${theme.borderRadius} - 2px)` : '6px'};
                    max-width: 80%;
                `;
                
                const messageText = document.createElement('div');
                messageText.style.cssText = 'font-size: 14px;';
                messageText.textContent = text;
                
                const messageTime = document.createElement('div');
                messageTime.style.cssText = 'font-size: 12px; opacity: 0.7; margin-top: 4px;';
                messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                messageContent.appendChild(messageText);
                messageContent.appendChild(messageTime);
                messageDiv.appendChild(messageContent);
                container.appendChild(messageDiv);
                
                // Scroll to bottom
                container.scrollTop = container.scrollHeight;
            },
            
            simulateBotResponse: function(container, message, botId, theme) {
                // Add typing indicator
                const typingDiv = document.createElement('div');
                typingDiv.className = 'pybot-message bot typing';
                typingDiv.style.cssText = 'display: flex; margin-bottom: 16px;';
                
                const typingContent = document.createElement('div');
                typingContent.style.cssText = `
                    background-color: #f1f5f9;
                    padding: 12px;
                    border-radius: ${theme.borderRadius ? `calc(${theme.borderRadius} - 2px)` : '6px'};
                    max-width: 80%;
                    display: flex;
                    align-items: center;
                `;
                
                typingContent.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pybot-typing-icon" style="margin-right: 8px; animation: pybot-spin 1s linear infinite;">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    <span style="font-size: 14px; color: #64748b;">Thinking...</span>
                `;
                
                typingDiv.appendChild(typingContent);
                container.appendChild(typingDiv);
                
                // Scroll to bottom
                container.scrollTop = container.scrollHeight;
                
                // In a real implementation, this would call your API
                setTimeout(() => {
                    // Remove typing indicator
                    container.removeChild(typingDiv);
                    
                    // Add bot response
                    let response = "I understand you're asking about that. In a real implementation, I would use the knowledge base to provide a relevant answer.";
                    
                    // Simple response logic based on keywords
                    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
                        response = "Hello! How can I assist you today?";
                    } else if (message.toLowerCase().includes('help')) {
                        response = "I'm here to help! You can ask me questions about our products, services, or anything else you need assistance with.";
                    } else if (message.toLowerCase().includes('thank')) {
                        response = "You're welcome! Is there anything else I can help you with?";
                    } else if (message.toLowerCase().includes('bye')) {
                        response = "Goodbye! Have a great day!";
                    }
                    
                    this.addMessage(container, response, 'bot', theme);
                }, 1500);
            }
        };
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pybot-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    })();
    """
    
    return HTMLResponse(content=js_content, media_type="application/javascript")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

