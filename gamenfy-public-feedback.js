// Gamenfy Public Beta feedback capture — isolated from private Gamenfy state.
// Performed by ChatGPT/OpenAI.
(function () {
  'use strict';

  const SUPABASE_URL = 'https://ttxjsoahmtennnufgeqx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab';
  const TABLE = 'gamenfy_public_feedback';

  const $ = (id) => document.getElementById(id);

  function feedbackMessage(text, ok) {
    const el = $('publicFeedbackMessage');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = ok ? '#2f8b63' : '#ad4d32';
  }

  function currentView() {
    const active = document.querySelector('.view.active');
    return active && active.id ? active.id.replace(/View$/, '') : 'unknown';
  }

  async function submitFeedback(event) {
    event.preventDefault();
    const textarea = $('publicFeedbackText');
    const button = $('publicFeedbackSubmit');
    if (!textarea || !button) return;

    const message = (textarea.value || '').trim();
    if (message.length < 4) {
      feedbackMessage('Schrijf heel even wat er onduidelijk, irritant of ontbrekend is.');
      return;
    }
    if (message.length > 800) {
      feedbackMessage('Hou feedback onder 800 tekens.');
      return;
    }
    if (!window.supabase || !window.supabase.createClient) {
      feedbackMessage('Feedback kon nu niet worden verbonden. Probeer straks opnieuw.');
      return;
    }

    button.disabled = true;
    feedbackMessage('Versturen…', true);
    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data } = await client.auth.getSession();
      const session = data && data.session;
      if (!session || !session.user) throw new Error('Log opnieuw in om feedback te sturen.');

      const context = {
        path: window.location.pathname,
        view: currentView(),
        score: ($('scoreNumber') && $('scoreNumber').textContent) || null,
        userAgent: (navigator.userAgent || '').slice(0, 240),
        beta: '0.2'
      };
      const { error } = await client.from(TABLE).insert({
        user_id: session.user.id,
        message,
        page: currentView().slice(0, 40),
        context
      });
      if (error) throw error;

      textarea.value = '';
      feedbackMessage('Verstuurd ✓ Dankje — dit komt direct bij de beta-feedback terecht.', true);
    } catch (error) {
      feedbackMessage(error && error.message ? error.message : 'Feedback versturen lukte niet. Probeer opnieuw.');
    } finally {
      button.disabled = false;
    }
  }

  function init() {
    const form = $('publicFeedbackForm');
    if (form) form.addEventListener('submit', submitFeedback);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
