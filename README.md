# NutriShield 🛡️

**A Personalized Hidden-Ingredient & Dietary-Risk Alert System**

NutriShield is a medical and dietary risk engine that evaluates food ingredients strictly against a user's personal health profile. Unlike generic health apps that assign universal scores, NutriShield operates on a core philosophy: **"Same Food ≠ Same Risk."**

---

## 👥 Team Name & Members

**Team Name:** Team Introverts
**Members:** 
- Amay
- Girish Nikose
- Ananya Shetty

---

## 🎯 Problem Statement

**Personalized Hidden-Ingredient & Dietary-Risk Alert System**

For millions of people managing chronic conditions (like Diabetes, Hypertension, or Chronic Kidney Disease) or severe food allergies (like Peanut or Milk allergies), generic food ratings are useless and potentially dangerous. A high-potassium snack is great for an athlete but harmful for someone with kidney disease. 

Furthermore, many dangerous ingredients hide behind complex chemical names (e.g., Maltodextrin, Casein). There is a critical need for an intelligent system that translates complex labels into personalized medical alerts.

---

## 💻 Tech Stack Used

- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **AI / Machine Learning:**
  - **Google Gemini Vision API:** For Optical Character Recognition (OCR) to extract ingredients from food labels.
  - **Ollama (Llama 3 Local):** For conversational Q&A, plain-language risk translation, and inferring ingredients for unlabelled street food.
- **External APIs:** Open Food Facts API (Barcode lookup)
- **Architecture:** Hybrid Deterministic-AI System (Strict Node.js Rule Engine + LLM Translation)

---

## 🚀 Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Ollama](https://ollama.com/) (Installed and running locally for the AI chatbot features)

### 2. Clone the Repository
```bash
git clone https://github.com/amayy05/Enigma_Teamintroverts_NutriShield.git
cd Enigma_Teamintroverts_NutriShield
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create a .env file and add your Google Gemini API Key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the backend server
npm start
```
*The backend will run on `http://localhost:3001`*

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Start the React development server
npm run dev
```
*The frontend will run on `http://localhost:5173`*

### 5. Running Ollama (Local AI)
Ensure Ollama is running in the background. You can pull the required model using:
```bash
ollama run llama3
```

---

## 🏆 Key Features Built
- **Personalized Risk Engine:** Evaluates ingredients against specific profiles (Diabetes, CKD, PCOS, Hypertension, Allergies).
- **OCR Label Scanning:** Take a photo of a label to extract ingredients via Gemini Vision.
- **Barcode Lookup:** Scan or type a barcode to pull data from Open Food Facts.
- **Street Food AI Inference:** Type a generic food name (e.g., "Samosa") and the AI will infer standard recipe ingredients to evaluate risk.
- **Compare Foods:** Compare two products side-by-side to find the "Better Choice" based on your medical profile.
