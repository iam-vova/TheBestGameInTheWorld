import { createApp } from 'vue';
import GameApp from '@/components/GameApp/GameApp.vue';
import { useGame } from '@/composables/useGame';
import '@fontsource/pixelify-sans/cyrillic-400.css';
import '@fontsource/pixelify-sans/cyrillic-600.css';
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-600.css';
import '@/styles/main.scss';

createApp(GameApp).mount('#app');

// отладочный доступ из консоли и автотестов
(window as unknown as { __game: ReturnType<typeof useGame> }).__game = useGame();
