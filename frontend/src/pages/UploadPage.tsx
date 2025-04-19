import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DocumentUploader from '../components/DocumentUploader';
import ChatInterface from '../components/ChatInterface';
import { useSession } from '../hooks/useSession';
import { uploadFiles, sendMessage, getChatHistory, clearChat } from '../utils/api';

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

const UploadPage: React.FC = () => {
  const sessionId = useSession();
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const result = await getChatHistory('upload');
      if (result.status === 'success') {
        setChatHistory(result.chat_history);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleUpload = async (files: File[], saveToAzure: boolean) => {
    if (!sessionId) return;
    
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const result = await uploadFiles(files, saveToAzure, sessionId);
      
      setUploadStatus({
        success: result.status === 'success',
        message: result.message
      });
      
      if (result.status === 'success') {
        setTimeout(() => {
          setUploadStatus(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus({
        success: false,
        message: 'An error occurred while uploading files'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!sessionId || isQuerying) return;
    
    setIsQuerying(true);
    
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatHistory(prev => [userMessage, ...prev]);
    
    try {
      const result = await sendMessage(message, 'upload', sessionId);
      
      if (result.status === 'success') {
        setChatHistory(result.chat_history);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request.',
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [errorMessage, ...prev]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I couldn\'t connect to the server. Please try again later.',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [errorMessage, ...prev]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChat('upload');
      setChatHistory([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const uploadInfo = uploadStatus && (
    <div className={`p-3 mb-4 rounded-md ${
      uploadStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`}>
      {uploadStatus.success ? (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {uploadStatus.message}
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          {uploadStatus.message}
        </div>
      )}
    </div>
  );

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Upload & Chat with Your Medical Documents
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <DocumentUploader 
              onUpload={handleUpload} 
              isLoading={isUploading} 
            />
            {uploadInfo}
          </div>
          
          <div className="h-[600px]">
            <ChatInterface 
              mode="upload"
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onClearHistory={handleClearHistory}
              isLoading={isQuerying}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UploadPage;