export default function decorate(block) {
  const url = block.textContent.trim().replace(/\s+/g, '');

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';

    if (url.includes('youtube.com')) {
      videoId = new URL(url).searchParams.get('v');
    } else {
      videoId = url.split('/').pop();
    }

    block.innerHTML = `
      <iframe
        width="100%"
        height="500"
        src="https://www.youtube.com/embed/${videoId}"
        title="YouTube Video"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;
    return;
  }

  // Twitter/X
  if (url.includes('twitter.com') || url.includes('x.com')) {
    block.innerHTML = `
      <blockquote class="twitter-tweet">
        <a href="${url}"></a>
      </blockquote>
    `;

    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return;
  }

  block.innerHTML = '<p>Unsupported URL</p>';
}
