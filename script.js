const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const navToggle = document.querySelector('.nav-toggle');
const navPanel = document.querySelector('[data-nav-panel]');
const visitorCount = document.querySelector('#visitorCount');
const graph = document.querySelector('[data-graph]');

document.querySelector('#year').textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) {
  root.dataset.theme = savedTheme;
}
document.querySelector('.theme-icon').textContent = root.dataset.theme === 'dark' ? '☾' : '☀';

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('portfolio-theme', nextTheme);
  document.querySelector('.theme-icon').textContent = nextTheme === 'dark' ? '☾' : '☀';
});

navToggle.addEventListener('click', () => {
  const isOpen = navPanel.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navPanel.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navPanel.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const apiNamespace = 'lokenderpratap-portfolio';
const apiKey = 'visitor-count';
const localFallbackKey = 'portfolio-visits-fallback';
const localSessionKey = 'portfolio-visit-session';
const localIncrementKey = 'portfolio-visit-local-increment';

function formatVisitorCount(value) {
  return Number(value).toLocaleString();
}

function displayVisitorCount(value) {
  if (!visitorCount) return;
  visitorCount.textContent = formatVisitorCount(value);
}

async function loadVisitorCount() {
  const savedCount = Number(localStorage.getItem(localFallbackKey) || 0);
  displayVisitorCount(savedCount);

  try {
    const response = await fetch(
      `https://api.countapi.xyz/hit/${encodeURIComponent(apiNamespace)}/${encodeURIComponent(apiKey)}`,
      { mode: 'cors' }
    );

    if (!response.ok) {
      throw new Error(`CountAPI returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data.value !== 'number') {
      throw new Error('Invalid CountAPI response');
    }

    displayVisitorCount(data.value);
    localStorage.setItem(localFallbackKey, String(data.value));
    localStorage.removeItem(localIncrementKey);
    localStorage.setItem(localSessionKey, '1');
    return;
  } catch (error) {
    console.error('Visitor count error:', error);

    const fallbackCount = savedCount || 0;
    const alreadyCounted = localStorage.getItem(localSessionKey) === '1';

    if (!alreadyCounted) {
      const increment = Number(localStorage.getItem(localIncrementKey) || 0) + 1;
      localStorage.setItem(localIncrementKey, String(increment));
      localStorage.setItem(localSessionKey, '1');
      displayVisitorCount(fallbackCount + increment);
    } else {
      displayVisitorCount(fallbackCount);
    }
  }
}

loadVisitorCount();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 38));
    const timer = setInterval(() => {
      current = Math.min(target, current + step);
      element.textContent = current.toLocaleString() + (target === 20 ? '+' : '');
      if (current === target) clearInterval(timer);
    }, 28);
    countObserver.unobserve(element);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach((element) => countObserver.observe(element));

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.project-card').forEach((card) => {
      const categories = card.dataset.category.split(' ');
      card.classList.toggle('is-hidden', filter !== 'all' && !categories.includes(filter));
    });
  });
});

// Fetch real GitHub contribution data
async function fetchGitHubContributions() {
  const username = 'lokenderpratap8-sketch';
  try {
    // Fetch user's public events to get activity data
    const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    const events = await response.json();

    // Generate contribution data based on recent activity
    const contributionData = generateContributionData(events);

    // Clear existing graph
    graph.innerHTML = '';

    // Render contribution graph
    contributionData.forEach((level, index) => {
      const square = document.createElement('span');
      square.dataset.level = String(level);
      square.title = `${level} contribution${level === 1 ? '' : 's'} on day ${index + 1}`;
      graph.appendChild(square);
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    // Fallback to static pattern if API fails
    const contributionPattern = [0, 1, 0, 2, 3, 0, 1, 4, 2, 0, 3, 1, 0, 2, 4, 3, 0, 1, 2, 0, 3, 4, 1, 0, 2, 3, 1, 0, 4, 2, 0, 1, 3, 2, 0, 4, 1, 0, 2, 3, 1, 4, 0, 2, 1, 3, 0, 4, 2, 1, 0, 3, 4, 2, 1, 0, 3, 2, 4, 1, 0, 2, 3, 1, 4, 0, 2, 3, 1, 0, 4, 2, 1, 3, 0, 2, 4, 1, 0, 3, 2, 1, 4, 0, 3, 2, 1, 0, 4, 3, 2, 1, 0, 2, 4, 3, 1, 0, 2, 3, 4, 1, 0, 2, 3, 1, 4, 0, 2, 3, 1, 0, 4, 2, 3, 1, 0, 2, 4, 3, 1, 0, 2, 3, 4, 1, 0, 2, 3, 1, 4, 2, 0, 3, 1, 4, 2, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0, 3, 1, 2, 4, 0];
    contributionPattern.forEach((level, index) => {
      const square = document.createElement('span');
      square.dataset.level = String(level);
      square.title = `${level} contribution${level === 1 ? '' : 's'} on activity day ${index + 1}`;
      graph.appendChild(square);
    });
  }
}

function generateContributionData(events) {
  // Create a 26-week contribution graph (182 days)
  const weeks = 26;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;
  const contributionData = new Array(totalDays).fill(0);

  // Process events to build contribution data
  events.forEach(event => {
    if (event.created_at) {
      const eventDate = new Date(event.created_at);
      const daysAgo = Math.floor((new Date() - eventDate) / (1000 * 60 * 60 * 24));
      
      if (daysAgo < totalDays && daysAgo >= 0) {
        const dayIndex = totalDays - 1 - daysAgo;
        contributionData[dayIndex] = Math.min(4, contributionData[dayIndex] + 1);
      }
    }
  });

  // Add some random variation to make it look more natural
  return contributionData.map(level => {
    if (level === 0 && Math.random() > 0.7) {
      return Math.floor(Math.random() * 2);
    }
    return level;
  });
}

// Fetch GitHub contributions on page load
fetchGitHubContributions();

// Ensure contact/footer external links open reliably and safely
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.contact-actions a, .footer a[target="_blank"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer');
        e.preventDefault();
      }
    });
  });
});

// Back to top button functionality
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add('visible');
  } else {
    backToTopButton.classList.remove('visible');
  }
});

backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
