
const form = document.getElementById('post-form');
const container = document.getElementById('posts-container');

const renderPosts = (posts) => {
  container.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.classList.add('post');
    div.innerHTML = `
      <h3>${post.title}</h3>
      <img src="${post.image}" width="200" />
      <p>${post.description}</p>
      <span class="likes-count">${post.likes}</span> ❤️ 
      <button class="like-btn">Like</button>
      <button class="delete-btn">❌</button>
    `;
    div.querySelector('.like-btn').addEventListener('click', async () => {
      try {
        const res = await fetch(`/posts/${post.id}/like`, { method: 'PUT' });
        const updatedPost = await res.json();
        div.querySelector('.likes-count').textContent = updatedPost.likes;
      } catch (err) { console.error(err); }
    });
    div.querySelector('.delete-btn').addEventListener('click', async () => {
      try {
        await fetch(`/posts/${post.id}`, { method: 'DELETE' });
        div.remove();
      } catch (err) { console.error(err); }
    });
    container.appendChild(div);
  });
};

const fetchPosts = async () => {
  const res = await fetch('/posts');
  const posts = await res.json();
  renderPosts(posts);
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const image = document.getElementById('image').value;
  const description = document.getElementById('description').value;
  try {
    await fetch('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, image, description }),
    });
    fetchPosts();
    form.reset();
  } catch (err) { console.error(err); }
});

fetchPosts();
