from typing import Dict, List, Any, Optional, Callable
import json
import re
from llm_integration import LLMIntegration

class WorkflowEngine:
    """
    Engine to process user messages through a bot's workflow
    """
    
    def __init__(self, workflow_data: Dict[str, Any], llm_integration: Optional[LLMIntegration] = None):
        """
        Initialize the workflow engine
        
        Args:
            workflow_data: The workflow data (nodes and edges)
            llm_integration: Optional LLM integration for AI nodes
        """
        self.nodes = {node["id"]: node for node in workflow_data.get("nodes", [])}
        self.edges = workflow_data.get("edges", [])
        self.llm_integration = llm_integration
        
        # Find the start node
        self.start_node_id = None
        for node_id, node in self.nodes.items():
            if node.get("type") == "start":
                self.start_node_id = node_id
                break
        
        if not self.start_node_id and self.nodes:
            # If no start node is explicitly defined, use the first node
            self.start_node_id = list(self.nodes.keys())[0]
    
    def process_message(
        self, 
        message: str, 
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a user message through the workflow
        
        Args:
            message: The user message
            conversation_history: Optional conversation history
            context: Optional context variables
            
        Returns:
            A dictionary with the response and any updated context
        """
        if not self.nodes or not self.start_node_id:
            return {
                "response": "Sorry, this bot doesn't have a configured workflow.",
                "context": context or {}
            }
        
        # Initialize context if not provided
        if context is None:
            context = {}
        
        # Add the user message to context
        context["user_message"] = message
        
        # Start processing from the start node
        current_node_id = self.start_node_id
        response = None
        
        # Track visited nodes to prevent infinite loops
        visited_nodes = set()
        
        # Process nodes until we reach a terminal node or detect a loop
        while current_node_id and current_node_id not in visited_nodes:
            visited_nodes.add(current_node_id)
            
            # Get the current node
            current_node = self.nodes.get(current_node_id)
            if not current_node:
                break
            
            # Process the node based on its type
            node_type = current_node.get("type", "")
            
            if node_type == "message":
                # Message node - set the response
                response = self._process_message_node(current_node, context)
                
            elif node_type == "condition":
                # Condition node - evaluate the condition and determine the next node
                condition_result = self._evaluate_condition(current_node, message, context)
                
                # Find the edge that matches the condition result
                next_node_id = None
                for edge in self.edges:
                    if edge.get("source") == current_node_id:
                        # Check if this edge has a condition that matches
                        edge_condition = edge.get("data", {}).get("condition")
                        
                        if edge_condition == condition_result or edge_condition == "default":
                            next_node_id = edge.get("target")
                            break
                
                current_node_id = next_node_id
                continue
                
            elif node_type == "ai":
                # AI node - generate a response using the LLM
                response = self._process_ai_node(current_node, message, conversation_history, context)
            
            # Find the next node (if any)
            next_node_id = None
            for edge in self.edges:
                if edge.get("source") == current_node_id:
                    next_node_id = edge.get("target")
                    break
            
            current_node_id = next_node_id
        
        # If we didn't set a response, provide a default
        if response is None:
            response = "I'm not sure how to respond to that."
        
        return {
            "response": response,
            "context": context
        }
    
    def _process_message_node(self, node: Dict[str, Any], context: Dict[str, Any]) -> str:
        """
        Process a message node
        
        Args:
            node: The message node
            context: The context variables
            
        Returns:
            The processed message text
        """
        message_template = node.get("data", {}).get("label", "")
        
        # Replace variables in the template
        for key, value in context.items():
            message_template = message_template.replace(f"{{{key}}}", str(value))
        
        return message_template
    
    def _process_ai_node(
        self, 
        node: Dict[str, Any], 
        message: str,
        conversation_history: Optional[List[Dict[str, Any]]],
        context: Dict[str, Any]
    ) -> str:
        """
        Process an AI node
        
        Args:
            node: The AI node
            message: The user message
            conversation_history: The conversation history
            context: The context variables
            
        Returns:
            The generated AI response
        """
        if not self.llm_integration:
            return "AI processing is not available."
        
        # Get node configuration
        node_data = node.get("data", {})
        system_prompt = node_data.get("systemPrompt", "You are a helpful assistant.")
        
        # Replace variables in the system prompt
        for key, value in context.items():
            system_prompt = system_prompt.replace(f"{{{key}}}", str(value))
        
        # Generate the response
        try:
            response = self.llm_integration.generate_response(
                prompt=message,
                system_prompt=system_prompt,
                conversation_history=conversation_history,
                model=node_data.get("model"),
                temperature=node_data.get("temperature", 0.7)
            )
            return response
        except Exception as e:
            print(f"Error in AI node: {e}")
            return "Sorry, I encountered an error while processing your request."
    
    def _evaluate_condition(self, node: Dict[str, Any], message: str, context: Dict[str, Any]) -> str:
        """
        Evaluate a condition node
        
        Args:
            node: The condition node
            message: The user message
            context: The context variables
            
        Returns:
            The condition result (e.g., "true", "false", or a custom value)
        """
        node_data = node.get("data", {})
        condition_type = node_data.get("conditionType", "keyword")
        
        if condition_type == "keyword":
            # Check for keywords in the message
            keywords = node_data.get("keywords", [])
            for keyword in keywords:
                if keyword.lower() in message.lower():
                    return "true"
            return "false"
            
        elif condition_type == "regex":
            # Check for regex pattern match
            pattern = node_data.get("pattern", "")
            if pattern and re.search(pattern, message, re.IGNORECASE):
                return "true"
            return "false"
            
        elif condition_type == "intent":
            # This would typically use an NLU service to detect intent
            # For simplicity, we'll just check for keywords
            intents = node_data.get("intents", {})
            for intent_name, keywords in intents.items():
                for keyword in keywords:
                    if keyword.lower() in message.lower():
                        return intent_name
            return "default"
            
        elif condition_type == "variable":
            # Check a context variable
            variable_name = node_data.get("variable", "")
            variable_value = context.get(variable_name)
            expected_value = node_data.get("value")
            
            if variable_value == expected_value:
                return "true"
            return "false"
            
        return "default"

# Example usage
if __name__ == "__main__":
    # Example workflow with a start node, a condition, and two message nodes
    workflow_data = {
        "nodes": [
            {
                "id": "1",
                "type": "start",
                "data": {"label": "Start Conversation"}
            },
            {
                "id": "2",
                "type": "condition",
                "data": {
                    "label": "Check greeting",
                    "conditionType": "keyword",
                    "keywords": ["hello", "hi", "hey"]
                }
            },
            {
                "id": "3",
                "type": "message",
                "data": {"label": "Hello! How can I help you today?"}
            },
            {
                "id": "4",
                "type": "message",
                "data": {"label": "I didn't understand that. Can you rephrase?"}
            }
        ],
        "edges": [
            {"id": "e1-2", "source": "1", "target": "2"},
            {"id": "e2-3", "source": "2", "target": "3", "data": {"condition": "true"}},
            {"id": "e2-4", "source": "2", "target": "4", "data": {"condition": "false"}}
        ]
    }
    
    # Create the workflow engine
    engine = WorkflowEngine(workflow_data)
    
    # Test with a greeting
    result = engine.process_message("Hello there!")
    print(f"Greeting response: {result['response']}")
    
    # Test with a non-greeting
    result = engine.process_message("What services do you offer?")
    print(f"Non-greeting response: {result['response']}")

