<script setup lang="ts">
import { ref, computed } from 'vue';

const showChatBubble = ref(false);
const isTyping = ref(false);
const typedText = ref('');
const fullText = "Hola soy LogIA, seré tu asistente virtual y sere la IA que te ayudará con toda consulta que tengas acerca de tu Comercio, cualquier duda házmela saber aquí.";

const toggleChatBubble = () => {
  if (!showChatBubble.value) {
    showChatBubble.value = true;
    startTypingAnimation();
  } else {
    showChatBubble.value = false;
    typedText.value = '';
    isTyping.value = false;
  }
};

const startTypingAnimation = () => {
  typedText.value = ''; // Reset texto
  isTyping.value = true;
  let index = 0;
  
  const typeText = () => {
    if (index < fullText.length && isTyping.value) {
      typedText.value += fullText.charAt(index);
      index++;
      setTimeout(typeText, 50); // Adjust typing speed here
    } else {
      isTyping.value = false;
    }
  };
  
  typeText();
};
</script>

<template>
  <div class="logia-container">
    <div class="logia-content">
      <div 
        class="logia-avatar" 
        @click="toggleChatBubble"
      >
        <img 
          src="../assets/test1.png" 
          alt="LogIA Avatar" 
          class="logia-image"
        />
        <div class="avatar-overlay">
          <span>Haz clic para hablar con LogIA</span>
        </div>
      </div>

      <transition name="bubble">
        <div 
          v-if="showChatBubble" 
          class="logia-chat-bubble"
        >
          <div 
            class="chat-content" 
            :class="{ 'is-typing': isTyping }"
          >
            {{ typedText }}
            <span v-if="isTyping" class="cursor">|</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

.logia-container {
  width: 80vw;
  overflow-x: hidden;
}

.logia-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 2rem;
  box-sizing: border-box;
}

.logia-avatar {
  width: 50%;
  max-width: 800px;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-right: 2rem;
}

.logia-avatar:hover {
  transform: scale(1.02);
}

.logia-image {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  object-fit: cover;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(134, 81, 231, 0.5);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 1rem;
}

.logia-avatar:hover .avatar-overlay {
  opacity: 1;
}

.logia-chat-bubble {
  position: relative;
  width: 350px;
  background: var(--bg-secondaryx);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  font-family: 'VT323', monospace;
  border: 2px solid rgba(134, 81, 231, 0.5);
  z-index: 10;
}

.logia-chat-bubble::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 20px 20px 20px 0;
  border-style: solid;
  border-color: transparent white;
  display: block;
  width: 0;
  z-index: 1;
}

.chat-content {
  font-size: 1.5rem;
  color: var(--text-primary);
  line-height: 1.4;
  min-height: 3rem;
}

.cursor {
  animation: blink 0.7s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.bubble-enter-to,
.bubble-leave-from {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 1200px) {
  .logia-avatar {
    width: 70%;
    max-width: 700px;
  }
}

@media (max-width: 992px) {
  .logia-content {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: flex;
    padding: 1rem;
    height: 100%;
  }

  .logia-avatar {
    width: 80%;
    margin-right: 0;
    margin-bottom: 2rem;
  }

  .logia-chat-bubble {
    position: flex;
    top: calc(100% + 1rem);
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    max-width: 500px;
    margin: 0 1rem;
    left: 50%;
  }

  .logia-chat-bubble::after {
    left: calc(50% - 10px);
    top: -20px;
    transform: rotate(-90deg);
    border-width: 20px 20px 20px 0;
    border-color: transparent white;
  }
}

@media (max-width: 576px) {
  .logia-avatar {
    width: 90%;
  }

  .logia-chat-bubble {
    padding: 1rem;
    top: calc(100% + 1rem);
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
  }

  .logia-chat-bubble::after {
    left: calc(50% - 10px);
  }

  .chat-content {
    font-size: 1.2rem;
  }
}
</style>