<template>
  <div class="register-container">
    <div class="register-box">
      <h1>Create Account</h1>
      
      <div v-if="error" class="error-message">{{ error }}</div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            v-model="form.name" 
            type="text" 
            id="name" 
            required
            placeholder="Your name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            id="email" 
            required
            placeholder="Your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              required
              placeholder="At least 6 characters"
            />
            <span 
              class="eye-icon"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-wrapper">
            <input 
              v-model="form.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              required
              placeholder="Confirm password"
            />
            <span 
              class="eye-icon"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </span>
          </div>
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>
      </form>

      <p class="login-link">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

export default {
  name: 'Register',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const loading = ref(false);
    const error = ref('');
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const form = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const handleRegister = async () => {
      error.value = '';
      loading.value = true;

      try {
        await authStore.register(form.value);
        router.push('/dashboard');
      } catch (err) {
        error.value = err.message || 'Registration failed';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      showPassword,
      showConfirmPassword,
      handleRegister
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;
}

.register-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.register-container::after {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -50%;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.register-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 420px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
}

h1 {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 35px;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 22px;
}

label {
  display: block;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e7ff;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

input::placeholder {
  color: #adb5bd;
}

input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

button:active:not(:disabled) {
  transform: translateY(-1px);
}

.error-message {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  color: #636e72;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  position: relative;
}

.login-link a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #667eea;
  transition: width 0.3s ease;
}

.login-link a:hover::after {
  width: 100%;
}
</style>
