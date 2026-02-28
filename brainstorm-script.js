// Store all ideas and filtered ideas
let allIdeas = [];
let filteredIdeas = [];
let currentIndex = 0;
let currentFilter = '';

// DOM elements
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const tagFilter = document.getElementById('tagFilter');
const ideaTitle = document.getElementById('ideaTitle');
const ideaText = document.getElementById('ideaText');
const ideaTags = document.getElementById('ideaTags');
const ideaCount = document.getElementById('ideaCount');

/**
 * Load ideas from ideas.json
 */
async function loadIdeas() {
  try {
    const response = await fetch('ideas.json');
    if (!response.ok) throw new Error('Failed to load ideas.json');
    allIdeas = await response.json();
    
    if (allIdeas.length === 0) {
      showError('No ideas found in ideas.json');
      return;
    }

    filteredIdeas = [...allIdeas];
    populateTagFilter();
    displayRandomIdea();
    updateIdeaCount();
  } catch (error) {
    showError(`Error loading ideas: ${error.message}`);
  }
}

/**
 * Convert URLs in text to clickable hyperlinks
 */
function convertUrlsToLinks(text) {
  if (!text) return '';
  
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Replace URLs with clickable links, escaping other HTML
  const div = document.createElement('div');
  div.textContent = text;
  let html = div.innerHTML;
  
  html = html.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return html;
}

/**
 * Extract all unique tags from ideas
 */
function getUniqueTags() {
  const tagsSet = new Set();
  allIdeas.forEach(idea => {
    if (idea.labels && Array.isArray(idea.labels)) {
      idea.labels.forEach(label => tagsSet.add(label));
    } else if (idea.labels && typeof idea.labels === 'string') {
      tagsSet.add(idea.labels);
    }
  });
  return Array.from(tagsSet).sort();
}

/**
 * Populate the tag filter dropdown
 */
function populateTagFilter() {
  const uniqueTags = getUniqueTags();
  uniqueTags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

/**
 * Display a random idea from the filtered list
 */
function displayRandomIdea() {
  if (filteredIdeas.length === 0) {
    ideaTitle.textContent = 'No ideas match this filter';
    ideaText.textContent = 'Try selecting a different tag.';
    ideaTags.innerHTML = '';
    nextBtn.disabled = true;
    return;
  }

  nextBtn.disabled = false;
  currentIndex = Math.floor(Math.random() * filteredIdeas.length);
  const idea = filteredIdeas[currentIndex];

  // Display title
  ideaTitle.textContent = idea.title || 'Untitled';

  // Display text content with clickable links
  ideaText.innerHTML = convertUrlsToLinks(idea.textContent || '');

  // Display tags
  ideaTags.innerHTML = '';
  if (idea.labels) {
    const labels = Array.isArray(idea.labels) ? idea.labels : [idea.labels];
    labels.forEach(label => {
      const tagElement = document.createElement('span');
      tagElement.className = 'tag';
      tagElement.textContent = label;
      ideaTags.appendChild(tagElement);
    });
  }
}

/**
 * Filter ideas by selected tag
 */
function filterIdeas() {
  const selectedTag = tagFilter.value;
  currentFilter = selectedTag;

  if (!selectedTag) {
    filteredIdeas = [...allIdeas];
  } else {
    filteredIdeas = allIdeas.filter(idea => {
      if (!idea.labels) return false;
      const labels = Array.isArray(idea.labels) ? idea.labels : [idea.labels];
      return labels.includes(selectedTag);
    });
  }

  currentIndex = 0;
  displayRandomIdea();
  updateIdeaCount();
}

/**
 * Update the idea count display
 */
function updateIdeaCount() {
  const count = filteredIdeas.length;
  const totalCount = allIdeas.length;
  
  if (currentFilter) {
    ideaCount.textContent = `Showing ${count} idea(s) with tag "${currentFilter}" (${totalCount} total)`;
  } else {
    ideaCount.textContent = `Loaded ${totalCount} ideas`;
  }
}

/**
 * Show error message
 */
function showError(message) {
  ideaTitle.textContent = '⚠️ Error';
  ideaText.textContent = message;
  ideaTags.innerHTML = '';
  nextBtn.disabled = true;
}

// Event listeners
nextBtn.addEventListener('click', displayRandomIdea);

resetBtn.addEventListener('click', () => {
  tagFilter.value = '';
  filterIdeas();
});

tagFilter.addEventListener('change', filterIdeas);

// Load ideas when page loads
document.addEventListener('DOMContentLoaded', loadIdeas);
