import {createApp} from 'vue'
import App from './App.vue'
import antd from './modules'
import './index.css'

// import VConsole from 'vconsole';
// let vconsole = new VConsole();
// export default vconsole;

createApp(App).use(antd).mount('#app')
