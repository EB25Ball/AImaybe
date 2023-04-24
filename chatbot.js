// Define an object to store the chat history
let chatHistory = [];

// Define a function to add a message to the chat history
function addToHistory(message, isUser) {
  chatHistory.push({
    message: message,
    isUser: isUser
  });
}

// Define a function to display the chat history in the chat window
function displayChatHistory() {
  let chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = '';
  chatHistory.forEach(function(chat) {
    let messageElement = document.createElement('div');
    messageElement.classList.add(chat.isUser ? 'user-message' : 'bot-message');
    messageElement.textContent = chat.message;
    chatWindow.appendChild(messageElement);
  });
}

// Define a function to generate a bot response based on user input
async function generateBotResponse(userInput) {
  // Check if the chatbot's knowledge file exists
  let fileExists = await checkFileExists('chatbot-knowledge.json');

  // If the file doesn't exist, create an empty object and save it to the file
  if (!fileExists) {
    let knowledge = {};
    await saveKnowledgeToFile(knowledge);
  }

  // Load the chatbot's knowledge from the file
  let knowledge = await loadKnowledgeFromFile();

  // If the user input matches a known question, return the corresponding answer
  if (userInput in knowledge) {
    return knowledge[userInput];
  }

  // Otherwise, ask the user for more information and store the response as new knowledge
  let botResponse = 'I am a chatbot and I do not know how to respond to that. Please provide more information:';
  addToHistory(botResponse, false);
  displayChatHistory();

  let response = await getUserResponse();
  knowledge[userInput] = response;

  // Save the updated knowledge to the file
  await saveKnowledgeToFile(knowledge);

  return response;
}

// Define a function to check if a file exists
async function checkFileExists(filename) {
  try {
    await fs.promises.access(filename, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// Define a function to load the chatbot's knowledge from a file
async function loadKnowledgeFromFile() {
  let contents = await fs.promises.readFile('chatbot-knowledge.json');
  return JSON.parse(contents);
}

// Define a function to save the chatbot's knowledge to a file
async function saveKnowledgeToFile(knowledge) {
  await fs.promises.writeFile('chatbot-knowledge.json', JSON.stringify(knowledge));
}

// Define a function to get the user's response to the chatbot's question
function getUserResponse() {
  return new Promise(resolve => {
    let sendButton = document.getElementById('send-button');
    let userInput = document.getElementById('user-input');
    sendButton.addEventListener('click', function handler() {
      let response = userInput.value.trim();
      if (response !== '') {
        sendButton.removeEventListener('click', handler);
        resolve(response);
      }
    });
  });
}

// Add an event listener to the send button
let sendButton = document.getElementById('send-button');
sendButton.addEventListener('click', async function() {
  let userInput = document.getElementById('user-input').value;
  if (userInput.trim() === '') {
    return;
  }
  addToHistory(userInput, true);
  document.getElementById('user-input').value = '';
  displayChatHistory();

  let botResponse = await generateBotResponse(userInput);
  addToHistory(botResponse, false);
  displayChatHistory();
});

// Display the initial chat message from the bot
addToHistory('Hello! I am a chatbot. How can I assist you today?', false);
displayChatHistory();