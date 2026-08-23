function tag(label) {
  const el = document.createElement("span");
  el.className = "tag";
  el.textContent = label;
  return el;
}

export function storyCard(story, {onOpen} = {}) {
  const el = document.createElement("article");
  el.className = "story-card";

  const h3 = document.createElement("h3");
  h3.textContent = story.title;

  const tags = document.createElement("div");
  tags.className = "tags";
  tags.append(
    tag(story.protagonist_role),
    tag(story.protagonist_gender),
    tag(story.setting),
    tag(story.sentiment)
  );

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = story.summary;

  const excerpt = document.createElement("p");
  excerpt.className = "excerpt";
  excerpt.textContent = story.excerpt;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "read-more";
  button.textContent = "Read full story →";
  button.addEventListener("click", () => onOpen?.(story));

  el.append(h3, tags, summary, excerpt, button);
  return el;
}
