// API utility functions for making requests to the backend

export async function startSession() {
    const response = await fetch('/api/start-session', {
      method: 'POST'
    });
    const data = await response.json();
    return data.session_id;
  }
  
  export async function uploadFiles(files: File[], saveToAzure: boolean, sessionId: string) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('pdfs', file);
    });
    formData.append('save_to_azure', saveToAzure.toString());
    formData.append('session_id', sessionId);
  
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  }
  
  export async function sendMessage(question: string, mode: 'upload' | 'azure', sessionId: string) {
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        question,
        mode,
        session_id: sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error('Query failed');
    }
    
    return await response.json();
  }
  
  export async function getAzureFiles() {
    const response = await fetch('/api/azure-files', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Azure files');
    }
    
    return await response.json();
  }
  
  export async function getChatHistory(mode: 'upload' | 'azure') {
    const response = await fetch(`/api/chat-history?mode=${mode}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    
    return await response.json();
  }
  
  export async function clearChat(mode: 'upload' | 'azure') {
    const response = await fetch('/api/clear-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ mode })
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear chat');
    }
    
    return await response.json();
  }