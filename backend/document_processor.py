import os
from typing import List
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from langchain.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    CSVLoader,
    UnstructuredURLLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_processor import KnowledgeBaseProcessor

def process_document(file_path: str, bot_id: str, source_id: str):
    """
    Process a document and add it to the bot's knowledge base
    
    Args:
        file_path: Path to the document
        bot_id: ID of the bot
        source_id: ID of the knowledge source
    """
    # Check file extension
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    # Load document based on file type
    if ext == '.pdf':
        loader = PyPDFLoader(file_path)
    elif ext == '.docx':
        loader = Docx2txtLoader(file_path)
    elif ext == '.txt':
        loader = TextLoader(file_path)
    elif ext == '.csv':
        loader = CSVLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
    
    # Load documents
    documents = loader.load()
    
    # Add source metadata
    for doc in documents:
        doc.metadata["source"] = os.path.basename(file_path)
    
    # Split documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    split_documents = text_splitter.split_documents(documents)
    
    # Add to knowledge base
    KnowledgeBaseProcessor.add_documents(bot_id, source_id, split_documents)

def process_website(url: str, bot_id: str, source_id: str, max_depth: int = 1):
    """
    Process a website and add it to the bot's knowledge base
    
    Args:
        url: URL of the website
        bot_id: ID of the bot
        source_id: ID of the knowledge source
        max_depth: Maximum depth to crawl
    """
    # Validate URL
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Get base URL for relative links
    parsed_url = urlparse(url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    
    # Crawl website
    urls = crawl_website(url, base_url, max_depth)
    
    # Load content from URLs
    loader = UnstructuredURLLoader(urls=urls)
    documents = loader.load()
    
    # Add source metadata
    for doc in documents:
        doc.metadata["source"] = url
    
    # Split documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    split_documents = text_splitter.split_documents(documents)
    
    # Add to knowledge base
    KnowledgeBaseProcessor.add_documents(bot_id, source_id, split_documents)

def crawl_website(url: str, base_url: str, max_depth: int = 1, current_depth: int = 0, visited: List[str] = None) -> List[str]:
    """
    Crawl a website and return a list of URLs
    
    Args:
        url: URL to crawl
        base_url: Base URL for relative links
        max_depth: Maximum depth to crawl
        current_depth: Current depth
        visited: List of visited URLs
        
    Returns:
        List of URLs
    """
    if visited is None:
        visited = []
    
    if current_depth > max_depth or url in visited:
        return []
    
    visited.append(url)
    urls = [url]
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return urls
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        if current_depth < max_depth:
            for link in soup.find_all('a', href=True):
                href = link['href']
                
                # Skip non-HTTP links, anchors, etc.
                if href.startswith(('#', 'mailto:', 'tel:', 'javascript:')):
                    continue
                
                # Handle relative URLs
                if not href.startswith(('http://', 'https://')):
                    href = urljoin(base_url, href)
                
                # Stay on the same domain
                if urlparse(href).netloc != urlparse(base_url).netloc:
                    continue
                
                # Crawl linked page
                if href not in visited:
                    urls.extend(crawl_website(href, base_url, max_depth, current_depth + 1, visited))
    
    except Exception as e:
        print(f"Error crawling {url}: {e}")
    
    return urls

