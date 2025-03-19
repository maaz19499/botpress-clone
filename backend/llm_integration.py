import os
import json
from typing import Dict, List, Any, Optional
import requests

class LLMIntegration:
    """
    Class to handle integration with various LLM providers
    """
    
    def __init__(self, provider: str = "openai", api_key: Optional[str] = None):
        """
        Initialize the LLM integration
        
        Args:
            provider: The LLM provider to use (openai, anthropic, etc.)
            api_key: API key for the provider (if None, will try to get from env vars)
        """
        self.provider = provider.lower()
        
        # Set API key
        if api_key:
            self.api_key = api_key
        else:
            # Try to get from environment variables
            if self.provider == "openai":
                self.api_key = os.getenv("OPENAI_API_KEY")
            elif self.provider == "anthropic":
                self.api_key = os.getenv("ANTHROPIC_API_KEY")
            else:
                raise ValueError(f"Unsupported provider: {provider}")
        
        if not self.api_key:
            raise ValueError(f"API key for {provider} not provided and not found in environment variables")
    
    def generate_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """
        Generate a response from the LLM
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt to guide the model
            conversation_history: Optional conversation history
            model: Optional model to use (defaults to provider's default)
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            The generated text response
        """
        if self.provider == "openai":
            return self._generate_openai_response(
                prompt, 
                system_prompt, 
                conversation_history, 
                model or "gpt-3.5-turbo", 
                temperature, 
                max_tokens
            )
        elif self.provider == "anthropic":
            return self._generate_anthropic_response(
                prompt, 
                system_prompt, 
                conversation_history, 
                model or "claude-2", 
                temperature, 
                max_tokens
            )
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def _generate_openai_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str], 
        conversation_history: Optional[List[Dict[str, Any]]],
        model: str,
        temperature: float,
        max_tokens: int
    ) -> str:
        """
        Generate a response using OpenAI's API
        """
        import openai
        
        openai.api_key = self.api_key
        
        messages = []
        
        # Add system prompt if provided
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add the current prompt
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating OpenAI response: {e}")
            return f"Error generating response: {str(e)}"
    
    def _generate_anthropic_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str], 
        conversation_history: Optional[List[Dict[str, Any]]],
        model: str,
        temperature: float,
        max_tokens: int
    ) -> str:
        """
        Generate a response using Anthropic's API
        """
        headers = {
            "x-api-key": self.api_key,
            "content-type": "application/json"
        }
        
        # Format the conversation for Anthropic
        formatted_prompt = ""
        
        # Add system prompt if provided
        if system_prompt:
            formatted_prompt += f"{system_prompt}\n\n"
        
        # Add conversation history if provided
        if conversation_history:
            for message in conversation_history:
                role = message["role"]
                content = message["content"]
                
                if role == "user":
                    formatted_prompt += f"Human: {content}\n\n"
                elif role == "assistant":
                    formatted_prompt += f"Assistant: {content}\n\n"
        
        # Add the current prompt
        formatted_prompt += f"Human: {prompt}\n\nAssistant:"
        
        data = {
            "prompt": formatted_prompt,
            "model": model,
            "max_tokens_to_sample": max_tokens,
            "temperature": temperature
        }
        
        try:
            response = requests.post(
                "https://api.anthropic.com/v1/complete",
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                return response.json()["completion"]
            else:
                error_msg = f"Error {response.status_code}: {response.text}"
                print(error_msg)
                return f"Error generating response: {error_msg}"
        except Exception as e:
            print(f"Error generating Anthropic response: {e}")
            return f"Error generating response: {str(e)}"

# Example usage
if __name__ == "__main__":
    # Example with OpenAI
    openai_llm = LLMIntegration(provider="openai")
    response = openai_llm.generate_response(
        prompt="What is the capital of France?",
        system_prompt="You are a helpful assistant that provides concise answers."
    )
    print(f"OpenAI response: {response}")
    
    # Example with Anthropic (if API key is available)
    try:
        anthropic_llm = LLMIntegration(provider="anthropic")
        response = anthropic_llm.generate_response(
            prompt="What is the capital of Germany?",
            system_prompt="You are a helpful assistant that provides concise answers."
        )
        print(f"Anthropic response: {response}")
    except ValueError:
        print("Anthropic API key not available, skipping example")

