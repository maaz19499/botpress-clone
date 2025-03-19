import os
from typing import List, Dict, Any, Tuple, Optional
import json
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

class KnowledgeBaseProcessor:
    """
    Handles the creation and management of knowledge bases for bots
    """
    
    @staticmethod
    def initialize_for_bot(bot_id: str):
        """
        Initialize a knowledge base for a bot
        """
        # Create directory for bot's knowledge base
        kb_dir = f"knowledge_bases/{bot_id}"
        os.makedirs(kb_dir, exist_ok=True)
        
        # Initialize empty vector store
        embeddings = OpenAIEmbeddings()
        Chroma(embedding_function=embeddings, persist_directory=kb_dir)
    
    @staticmethod
    def add_documents(bot_id: str, source_id: str, documents: List[Any]):
        """
        Add documents to a bot's knowledge base
        """
        kb_dir = f"knowledge_bases/{bot_id}"
        
        # Load existing vector store
        embeddings = OpenAIEmbeddings()
        vectorstore = Chroma(embedding_function=embeddings, persist_directory=kb_dir)
        
        # Add metadata to documents
        for doc in documents:
            doc.metadata["source_id"] = source_id
        
        # Add documents to vector store
        vectorstore.add_documents(documents)
        vectorstore.persist()
    
    @staticmethod
    def remove_source(bot_id: str, source_id: str):
        """
        Remove documents from a source from the knowledge base
        """
        kb_dir = f"knowledge_bases/{bot_id}"
        
        # Load existing vector store
        embeddings = OpenAIEmbeddings()
        vectorstore = Chroma(embedding_function=embeddings, persist_directory=kb_dir)
        
        # Delete documents with matching source_id
        vectorstore.delete(where={"source_id": source_id})
        vectorstore.persist()
    
    @staticmethod
    def get_vectorstore(bot_id: str) -> Optional[Chroma]:
        """
        Get the vector store for a bot
        """
        kb_dir = f"knowledge_bases/{bot_id}"
        
        if not os.path.exists(kb_dir):
            return None
        
        # Load existing vector store
        embeddings = OpenAIEmbeddings()
        return Chroma(embedding_function=embeddings, persist_directory=kb_dir)

class ChatProcessor:
    """
    Processes chat messages using LangChain and the bot's knowledge base
    """
    
    def __init__(self, bot_id: str):
        self.bot_id = bot_id
        self.vectorstore = KnowledgeBaseProcessor.get_vectorstore(bot_id)
    
    def process_message(
        self, 
        message: str, 
        conversation_history: List[Dict[str, Any]],
        system_prompt: str
    ) -> Tuple[str, List[Dict[str, str]]]:
        """
        Process a message using the bot's knowledge base
        
        Args:
            message: The user message
            conversation_history: Previous messages in the conversation
            system_prompt: The system prompt for the bot
            
        Returns:
            A tuple of (response_text, sources)
        """
        if not self.vectorstore:
            return "I don't have any knowledge to answer that question. Please add some documents to my knowledge base.", []
        
        # Convert conversation history to the format expected by LangChain
        langchain_history = []
        for msg in conversation_history:
            if msg.get("sender") == "user":
                langchain_history.append((msg.get("content", ""), ""))
            elif msg.get("sender") == "bot":
                if langchain_history:
                    langchain_history[-1] = (langchain_history[-1][0], msg.get("content", ""))
                else:
                    langchain_history.append(("", msg.get("content", "")))
        
        # Create memory
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Add conversation history to memory
        for human, ai in langchain_history:
            if human:
                memory.chat_memory.add_user_message(human)
            if ai:
                memory.chat_memory.add_ai_message(ai)
        
        # Create retriever
        retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 5}
        )
        
        # Create custom prompt
        custom_prompt = PromptTemplate(
            template="""
            {system_prompt}
            
            Context information is below.
            ---------------------
            {context}
            ---------------------
            
            Given the context information and not prior knowledge, answer the question.
            If you don't know the answer, just say that you don't know. Don't try to make up an answer.
            
            Question: {question}
            """,
            input_variables=["context", "question", "system_prompt"]
        )
        
        # Create chain
        llm = ChatOpenAI(temperature=0.2)
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": custom_prompt}
        )
        
        # Process message
        result = qa_chain({"question": message, "system_prompt": system_prompt})
        
        # Extract sources
        sources = []
        for doc in result.get("source_documents", []):
            if doc.metadata and "source" in doc.metadata:
                source = {
                    "text": doc.page_content[:100] + "...",
                    "source": doc.metadata["source"]
                }
                if source not in sources:
                    sources.append(source)
        
        return result["answer"], sources

