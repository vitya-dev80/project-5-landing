import AOS from 'aos';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

// Инициализация анимаций при скролле
AOS.init({
  duration: 800,
  once: true,
});

// Инициализация слайдера Swiper
new Swiper('.mySwiper', {
  modules: [Navigation, Pagination],
  slidesPerView: 1,
  spaceBetween: 20,
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
  },
});

// 3. Конфігурація Telegram (вставте свої токен і Chat ID)
const TELEGRAM_BOT_TOKEN = '8903552183:AAESbrTGsLfmxro7F_wtU5JGd4YtME9-RZw';
const TELEGRAM_CHAT_ID = '644009687';

// 4. Паралельна відправка форми (Email + Telegram)
const form = document.getElementById('form');

if (form) {
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const name = form.querySelector('input[name="name"]')?.value || '';
    const email = form.querySelector('input[name="email"]')?.value || '';
    const message = form.querySelector('textarea[name="message"]')?.value || '';

    // Дані для Web3Forms
    const payload = {
      access_key: '9de5c832-17b2-4c87-b2d4-c576bc4ca785',
      name,
      email,
      message,
    };

    // Текст для Telegram
    const telegramText = `📩 *Нова заявка з сайту!*\n\n👤 *Ім'я:* ${name}\n📧 *Email:* ${email}\n💬 *Повідомлення:* ${message}`;

    try {
      // 1. Запит до Web3Forms (Email)
      const emailPromise = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // 2. Запит до Telegram Bot API
      const telegramPromise = fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramText,
          parse_mode: 'Markdown',
        }),
      });

      // Виконуємо обидва запити одночасно
      const [emailRes] = await Promise.all([emailPromise, telegramPromise]);
      const data = await emailRes.json();

      if (data.success) {
        alert('Успіх! Ваша заявка відправлена на Email та в Telegram.');
        form.reset();
      } else {
        alert('Помилка: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Щось пішло не так. Спробуйте ще раз.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}