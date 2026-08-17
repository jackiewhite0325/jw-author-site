function dismissToast() {
  const toast = document.getElementById('invitation-toast');
  if (toast) {
    toast.style.display = "none";
    toast.setAttribute('aria-hidden', 'true');
  }
}

function clearNavigationLock() {
  const leftArrow = document.getElementById('guide-arrow-left');
  const rightArrow = document.getElementById('guide-arrow-right');
  
  if (leftArrow) leftArrow.style.display = "none";
  if (rightArrow) rightArrow.style.display = "none";
  
  dismissToast();
}
