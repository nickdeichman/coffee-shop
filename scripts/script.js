const burgerMenuButton = document.querySelector('.burger-menu');
const sliderArrows = document.querySelectorAll('.slider-arrow');
const sliderStatus = document.querySelector('.slider-status');
const slider = document.querySelector('.slider');
let currentPos = 0;
let i = 0;
let progressInterval = setInterval(progress, 50);
let isPaused = false;
let touchStartX = 0;
let touchEndX = 0;
const menu = document.querySelector('#header-nav');
const menuButtonLink = document.querySelector('.menu-link');
let clonedMenuButtonLink;


//Event listeners for swiping on slider
slider.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
});
slider.addEventListener('touchend', (event) => {
  touchEndX = event.changedTouches[0].clientX;
  handleSwipe();
});

//Calculating in which direction was swipe. If swiped right - show prev slide, if swiped left - show next slide
function handleSwipe() {
  const swipeThreshold = 50;
  const deltaX = touchEndX - touchStartX;
  if (deltaX > swipeThreshold) {
    moveSlide(-1);
  } else if (deltaX < -swipeThreshold) {
    moveSlide(1);
  }
}

//Track which arrow was clicked
sliderArrows.forEach((arrow) => {
  arrow.addEventListener('click', () => {
    const offset = arrow.classList.contains('next') ? 1 : -1;
    moveSlide(offset);
  });
});

// Progress bar for slider
function progress() {
  if (isPaused) return;
  let progressBar = document.querySelectorAll('.progress-bar.active');
  let currentBar = progressBar[0];
  if (i > 100) {
    moveSlide(1);
    i = 0;
    currentBar.querySelector('.progress').style.width = 0;
  } else {
    i += 1;
    currentBar.querySelector('.progress').style.width = `${i}%`;
  }
}


//Change slide depending on offset. Offset === 1 -> next slide, 0 -> previous slide
//If current slide is last and offset is 1 -> moving to the first slide
//If current slide is first and offset is 0 -> moving to the last slide
function moveSlide(offset) {
  const slides = slider.querySelectorAll('.slider-item');
  const activeSlide = slider.querySelector('.active');
  const sliderWidth = activeSlide.offsetWidth;
  const sliderLine = document.querySelector('.slider-line');
  let newIndex = [...slides].indexOf(activeSlide) + offset;
  if (offset === 1) {
    currentPos += sliderWidth;
  } else {
    currentPos -= sliderWidth;
  }
  if (newIndex < 0) {
    newIndex = slides.length - 1;
    currentPos = sliderWidth * (slides.length - 1);
  }
  if (newIndex > slides.length - 1) {
    newIndex = 0;
    currentPos = 0;
  }
  slides[newIndex].classList.add('active');
  activeSlide.classList.remove('active');
  sliderLine.style.transform = `translate(-${currentPos}px)`;
  sliderStatus.children[newIndex].classList.add('active');
  sliderStatus.children[[...slides].indexOf(activeSlide)].classList.remove(
    'active'
  );
  i = 0;
}
//Event listeners to stop progress with cursor
slider.addEventListener('mouseenter', () => {
  isPaused = true; // Pause the progress
});
slider.addEventListener('mouseleave', () => {
  isPaused = false; // Resume the progress
});

//Event listeners to stop progress with touch
slider.addEventListener('touchstart', () => {
  isPaused = true; // Pause the progress
});
slider.addEventListener('touchend', () => {
  isPaused = false; // Resume the progress
});

//Event listener for burger menu
burgerMenuButton.addEventListener('click', () => {
  burgerMenuButton.classList.contains('active') ? closeMenu() : openMenu();
});

//Close burger menu
function closeMenu() {
  menu.classList.remove('active');
  burgerMenuButton.classList.remove('active');
  let menuLink = [...menu.children].filter((child) => {
    return child === clonedMenuButtonLink;
  });
  setTimeout(() => {
    if (menu.contains(menuLink[0])) {
      menu.removeChild(menuLink[0]);
    }
  }, 200);
}

//Open burger menu
function openMenu() {
  burgerMenuButton.classList.add('active');
  if (clonedMenuButtonLink !== null) {
    clonedMenuButtonLink = menuButtonLink.cloneNode(true);
    menu.appendChild(clonedMenuButtonLink);
  }
  menu.classList.add('active');
}


window.addEventListener('scroll', () => {
  if (window.scrollY >= 20) {
    closeMenu();
  }
});


//When window resizing more or equal, than 768px - closing burger menu 
function closeMenuOnResize() {
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      menu.classList.remove('active');
      burgerMenuButton.classList.remove('active');
      let menuLink = [...menu.children].filter((child) => {
        return child === clonedMenuButtonLink;
      });
      if (menu.contains(menuLink[0])) {
        menu.removeChild(menuLink[0]);
      }
    }
  });
}

closeMenuOnResize();