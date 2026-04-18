import { apiService } from "../index.mjs";

/**
 * Create a profile component
 * @param {string} template - The ID of the template to clone
 * @param {Object} profileData - The profile data to display
 * @returns {DocumentFragment} - The profile UI
 */
function createProfile(template, { profileData, whoToFollow, isLoggedIn }) {
  if (!template || !profileData) return;

  const profileElement = document
    .getElementById(template)
    .content.cloneNode(true);

  const usernameEl = profileElement.querySelector("[data-username]");
  const bloomCountEl = profileElement.querySelector("[data-bloom-count]");
  const followingCountEl = profileElement.querySelector(
    "[data-following-count]"
  );
  const followerCountEl = profileElement.querySelector(
    "[data-follower-count]"
  );
  const followButtonEl = profileElement.querySelector(
    "[data-action='follow']"
  );
  const whoToFollowContainer = profileElement.querySelector(
    ".profile__who-to-follow"
  );

  // ===== PROFILE DATA =====
  usernameEl.querySelector("h2").textContent = profileData.username || "";
  usernameEl.setAttribute("href", `/profile/${profileData.username}`);
  bloomCountEl.textContent = profileData.total_blooms || 0;
  followerCountEl.textContent = profileData.followers?.length || 0;
  followingCountEl.textContent = profileData.follows?.length || 0;

  // ===== FOLLOW BUTTON =====
  followButtonEl.setAttribute("data-username", profileData.username || "");

  if (!isLoggedIn || profileData.is_self) {
    followButtonEl.style.display = "none";
  } else {
    followButtonEl.style.display = "inline-block";

    if (profileData.is_following) {
      followButtonEl.textContent = "Unfollow";
      followButtonEl.addEventListener("click", handleUnfollow);
    } else {
      followButtonEl.textContent = "Follow";
      followButtonEl.addEventListener("click", handleFollow);
    }
  }

  // ===== WHO TO FOLLOW =====
  if (whoToFollow.length > 0) {
    const whoToFollowList = whoToFollowContainer.querySelector(
      "[data-who-to-follow]"
    );
    const whoToFollowTemplate = document.querySelector(
      "#who-to-follow-chip"
    );

    for (const userToFollow of whoToFollow) {
      const wtfElement =
        whoToFollowTemplate.content.cloneNode(true);

      const usernameLink =
        wtfElement.querySelector("a[data-username]");
      usernameLink.innerText = userToFollow.username;
      usernameLink.setAttribute(
        "href",
        `/profile/${userToFollow.username}`
      );

      const followButton = wtfElement.querySelector("button");
      followButton.setAttribute(
        "data-username",
        userToFollow.username
      );

      // Correct follow/unfollow logic
      if (userToFollow.is_following) {
        followButton.textContent = "Unfollow";
        followButton.addEventListener("click", handleUnfollow);
      } else {
        followButton.textContent = "Follow";
        followButton.addEventListener("click", handleFollow);
      }

      if (!isLoggedIn) {
        followButton.style.display = "none";
      }

      whoToFollowList.appendChild(wtfElement);
    }
  } else {
    whoToFollowContainer.innerText = "";
  }

  return profileElement;
}

// ===== HANDLERS =====

async function handleFollow(event) {
  const button = event.target;
  const username = button.getAttribute("data-username");
  if (!username) return;

  await apiService.followUser(username);
  await apiService.getWhoToFollow();
}

async function handleUnfollow(event) {
  const button = event.target;
  const username = button.getAttribute("data-username");
  if (!username) return;

  await apiService.unfollowUser(username);
  await apiService.getWhoToFollow();
}

export { createProfile, handleFollow, handleUnfollow };