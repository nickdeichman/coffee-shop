let data;
const burgerMenuButton = document.querySelector('.burger-menu');
const menu = document.querySelector('.menu');
const tabButtons = document.querySelectorAll('.item-tab');
const showMoreBtn = document.querySelector('.show-more');
let clonedMenuButtonLink;

//Fetching data from json file
async function fetchData() {
  try {
    const response = await fetch('./data/products.json');
    const jsonData = await response.json();
    data = jsonData;
  } catch (error) {
    console.log('Ошибка при загрузке JSON:', error);
  }
}
fetchData().then(() => {
  let itemCards;
  let requireItems;
  function getItems(itemType) {
    // Depends on string with item name pushing items from json file to array
    let items = [];
    switch (itemType) {
      case 'coffee':
        data.map((item) => {
          item.category === 'coffee' ? items.push(item) : 0;
        });
        break;
      case 'tea':
        data.map((item) => {
          item.category === 'tea' ? items.push(item) : 0;
        });
        break;
      case 'dessert':
        data.map((item) => {
          item.category === 'dessert' ? items.push(item) : 0;
        });
        break;
    }
    return items;
  }
  tabButtons.forEach((tabButton) => {
    //Check if tab button is selected and if true - create item cards from name of tab button
    if (tabButton.classList.contains('active')) {
      let tempArr = tabButton.innerHTML.split('>');
      createItemCards(getItems(tempArr[tempArr.length - 1].toLowerCase()));
    }
  });
  //On click at button depends on name of it creating cards with required items
  tabButtons.forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      tabButtons.forEach((tabButton) => {
        tabButton.classList.remove('active');
      });
      tabButton.classList.add('active');
      if (tabButton.innerHTML.endsWith('Coffee')) {
        clearMenu(); // Clears menu immediately after selecting another items tab
        requireItems = getItems('coffee');
        createItemCards(requireItems);
        checkIsAllCardShown() ? showMoreBtn() : hideShowMoreBtn();
      } else if (tabButton.innerHTML.endsWith('Tea')) {
        clearMenu();
        requireItems = getItems('tea');
        createItemCards(requireItems);
        checkIsAllCardShown() ? showMoreBtn() : hideShowMoreBtn();
      } else if (tabButton.innerHTML.endsWith('Dessert')) {
        clearMenu();
        requireItems = getItems('dessert');
        createItemCards(requireItems);
        checkIsAllCardShown() ? showMoreBtn() : hideShowMoreBtn();
      }
    });
  });
  // Create cards on template with data from json
  function createItemCards(itemsData) {
    itemsData.map((item, index) => {
      let itemCard = `
            <div class="card">
                <div class="card-image">
                  <img class='item-image' src='./assets/${item.category}-${
        index + 1
      }.png' alt="">
                </div>
            <div class="card-text">
                <div class="card-text-top">
                <h2 class="item-name">${item.name}</h2>
                <p class="item-description">
                  ${item.description}
                </p>
            </div>
            <span class="price">$${item.price}</span>
          </div>
        </div>
        </div>
            `;
      menu.innerHTML += itemCard; // adding in menu section each card
      itemCards = document.querySelectorAll('.card');
      setVisibilityForCard(itemCards); // adding class for each card to make it visible
      hideCards(itemCards); // depends on window size or window resize - cards, thats more than 4
      showMoreCards(itemCards); // adding lister for button which on click show an other cards
    });
    // Create modal on click on each card
    itemCards.forEach((card) => {
      const modal = document.querySelector('.item-modal');
      card.addEventListener('click', () => {
        const itemSizes = getItemSizes(card);
        const itemSizeValuesAndPrices = getItemValuesAndPrices(card);
        const itemAdditivesAndPrices = getItemAdditivesAndPrices(card);
        let itemImage = card.querySelector('.card-image').innerHTML;
        let itemTitle = card.querySelector('.item-name').innerHTML;
        let itemDescription = card.querySelector('.item-description').innerHTML;
        let itemPrice = card.querySelector('.price').innerHTML;
        let innerCard = `<div class="left-modal">${itemImage}</div>
        <div class="right-modal">
        <div class="text-top">
            <h2 class='item-title'>${itemTitle}</h2>
            <p>${itemDescription}</p>
        </div>
        <div class="option-block">
            <span class="tab-span">Size</span>
            <div class="tabs">
            <span class="item-tab size active"><span>${itemSizes[0].toUpperCase()}</span>${
          itemSizeValuesAndPrices[0].size
        }</span>
            <span class="item-tab size "><span>${itemSizes[1].toUpperCase()}</span>${
          itemSizeValuesAndPrices[1].size
        }</span>
            <span class="item-tab size "><span>${itemSizes[2].toUpperCase()}</span>${
          itemSizeValuesAndPrices[2].size
        }</span>
            </div>
        </div>
        <div class="option-block">
            <span class="tab-span">Additives</span>
            <div class="tabs">
            <span class="item-tab additive"><span>1</span>${
              itemAdditivesAndPrices[0].name
            }</span>
            <span class="item-tab additive"><span>2</span>${
              itemAdditivesAndPrices[1].name
            }</span>
            <span class="item-tab additive"><span>3</span>${
              itemAdditivesAndPrices[2].name
            }</span>
            </div>
        </div>
        <div class='item-price'><span>Total:</span> <span class='price-number'>${itemPrice}</span></div>
        <div class='right-modal-bottom'>
            <p class='alert'>
                <img src='./assets/info-empty.svg' alt=''>
                The cost is not final. Download our mobile app to see the final price and place your order. Earn loyalty points and enjoy your favorite coffee with up to 20% discount.
            </p>
            <span class="close-btn">Close</span>
        </div>
        </div>`;
        modal.innerHTML = innerCard;
        closeModal(modal, itemCards); // add different types of closing modal of card
        let additivesPrices = selectAdditives(itemAdditivesAndPrices);
        selectSize(itemSizeValuesAndPrices, additivesPrices); // calculate price of item depends on additives and sizes
        document.querySelector('.modal-overlay').classList.add('active');
        modal.classList.add('active');
        document.body.style.overflowY = 'hidden';
      });
    });
  }

  function selectSize(itemSizeValuesAndPrices, additivesPrices) {
    const sizeTabs = document.querySelectorAll('.size');
    let itemPriceElement = document.querySelector('.price-number');
    let currentPriceModifier = 0.0; //Price of previous selected size. First value is 0.0 according to data from json
    sizeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const itemPrice = parseFloat(itemPriceElement.innerHTML.slice(1)); // removing $ symbol and parse to float
        const selectedSize = itemSizeValuesAndPrices.find(
          (
            item // get key value from json that equals size from tab
          ) => tab.innerHTML.includes(item.size)
        );
        if (tab.classList.contains('active')) {
          // if tab is active - nothing happens. no adding price or so.
          return;
        }
        sizeTabs.forEach((tab) => {
          tab.classList.remove('active');
        });
        if (additivesPrices !== undefined) {
          // if additives was selected
          const newPrice =
            itemPrice +
            parseFloat(selectedSize['add-price']) + // extract number that we need to add in price
            additivesPrices - // price of all additives that was added
            currentPriceModifier;
          itemPriceElement.innerHTML = `$${newPrice.toFixed(2)}`; // remove extra symbols after .
        } else {
          const newPrice =
            itemPrice +
            parseFloat(selectedSize['add-price']) -
            currentPriceModifier;
          itemPriceElement.innerHTML = `$${newPrice.toFixed(2)}`;
        }
        currentPriceModifier = parseFloat(selectedSize['add-price']); // set new value for next calculation
        tab.classList.add('active');
      });
    });
  }

  function selectAdditives(itemAdditivesAndPrices) {
    const additivesTabs = document.querySelectorAll('.additive'); // get all additive tabs
    let itemPriceElement = document.querySelector('.price-number'); // get start value of item price
    let addablePrice;
    additivesTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        let itemPrice = itemPriceElement.innerHTML.slice(1);
        const currentPrice = Number.parseFloat(itemPrice);
        addablePrice = itemAdditivesAndPrices.filter((item) => {
          return tab.innerHTML.includes(item.name);
        });
        if (tab.classList.contains('active')) {
          const newPrice =
            currentPrice - Number.parseFloat(addablePrice[0]['add-price']);
          itemPriceElement.innerHTML = `$${newPrice.toFixed(2)}`;
          tab.classList.remove('active');
          return;
        }
        tab.classList.add('active');
        const newPrice =
          currentPrice + Number.parseFloat(addablePrice[0]['add-price']);
        itemPriceElement.innerHTML = `$${newPrice.toFixed(2)}`;
      });
    });
  }

  // get all available sizes for the current item
  function getItemSizes(item) {
    const itemSizesSet = new Set(); // to remove repeated data
    data.forEach((itemData) => {
      if (itemData.name === item.querySelector('.item-name').innerHTML) {
        Object.keys(itemData.sizes).forEach((key) => {
          itemSizesSet.add(key);
        });
      }
    });
    const itemSizes = Array.from(itemSizesSet);
    return itemSizes;
  }

  // get all available value of sizes and its price for the current item
  function getItemValuesAndPrices(item) {
    const itemValuesAndPricesSet = new Set(); // to remove repeated data
    data.forEach((itemData) => {
      if (itemData.name === item.querySelector('.item-name').innerHTML) {
        Object.values(itemData.sizes).forEach((values) => {
          itemValuesAndPricesSet.add(values);
        });
      }
    });
    const itemValuesAndPrices = Array.from(itemValuesAndPricesSet);
    return itemValuesAndPrices;
  }

  // get all names of additives their prices for the current item
  function getItemAdditivesAndPrices(item) {
    const itemAdditivesAndPricesSet = new Set();
    data.forEach((itemData) => {
      if (itemData.name === item.querySelector('.item-name').innerHTML) {
        Object.values(itemData.additives).forEach((values) => {
          itemAdditivesAndPricesSet.add(values);
        });
      }
    });
    const itemAdditivesAndPrices = Array.from(itemAdditivesAndPricesSet);
    return itemAdditivesAndPrices;
  }

  // removes modal of card, delete cards from menu section
  function clearMenu() {
    const modal = document.querySelector('.item-modal');
    closeModal(modal);
    isAllCardShown = false;
    displayShowMoreBtn();
    hideShowMoreBtn();
    [...menu.children].forEach((item) => {
      item.classList.contains('card') ? menu.removeChild(item) : 0;
      if (item.classList.contains('item-modal')) {
        modal.classList.remove('active');
      }
    });
  }

  function checkIsAllCardShown() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      if (!card.classList.contains('show-card')) {
        isAllCardShown = false;
        return false;
      }
      isAllCardShown = true;
      return true;
    });
  }
});

let isAllCardShown = false;

displayShowMoreBtn();
hideShowMoreBtn();

// if window size is smaller than 768px then display show more button
function displayShowMoreBtn() {
  if (window.innerWidth <= 768 && !isAllCardShown) {
    showMoreBtn.classList.remove('hidden');
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !isAllCardShown) {
      showMoreBtn.classList.remove('hidden');
    }
  });
}

function hideShowMoreBtn() {
  if (isAllCardShown) {
    showMoreBtn.classList.add('hidden');
    return;
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      showMoreBtn.classList.add('hidden');
      isAllCardShown = false;
    }
  });
}

function hideCards(cards) {
  if (window.innerWidth <= 768 && !isAllCardShown) {
    cards.forEach((card, index) => {
      index > 3 ? card.classList.remove('show-card') : 0;
    });
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !isAllCardShown) {
      cards.forEach((card, index) => {
        index > 3 ? card.classList.remove('show-card') : 0;
      });
    }
  });
}

function setVisibilityForCard(cards) {
  cards.forEach((card) => {
    card.classList.add('show-card');
  });
}

// on click on button display hidden cards
function showMoreCards(cards) {
  showMoreBtn.addEventListener('click', () => {
    setVisibilityForCard(cards);
    cards.forEach((card) => {
      if (!card.classList.contains('show-card')) {
        // if all cards was displayed - this function still be available
        isAllCardShown = false;
        return;
      }
    });
    isAllCardShown = true;
    hideShowMoreBtn();
  });
}

burgerMenuButton.addEventListener('click', () => {
  const menu = document.querySelector('#header-nav');
  const menuButtonLink = document.querySelector('.menu-link');
  burgerMenuButton.classList.contains('active')
    ? closeMenu(menu, menuButtonLink)
    : openMenu(menu, menuButtonLink);
});

function closeMenu(menu) {
  menu.classList.remove('active');
  burgerMenuButton.classList.remove('active');
  let menuLink = [...menu.children].filter((child) => {
    return child === clonedMenuButtonLink;
  });
  setTimeout(() => {
    // setting timeout for proper animation
    if (menu.contains(menuLink[0])) {
      menu.removeChild(menuLink[0]);
    }
  }, 200);
}

function closeMenuOnResize() {
  const menu = document.querySelector('#header-nav');
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

function closeMenuOnScroll() {
  const menu = document.querySelector('#header-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY >= 20) {
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
  });
}

function openMenu(menu, menuButtonLink) {
  burgerMenuButton.classList.add('active');
  if (!menu.contains(menuButtonLink)) {
    clonedMenuButtonLink = menuButtonLink.cloneNode(true);
    clonedMenuButtonLink.href = '#';
    menu.appendChild(clonedMenuButtonLink);
  }
  menu.classList.add('active');
  clonedMenuButtonLink.addEventListener('click', (event) => {
    closeMenu(menu);
  });
  closeMenuOnScroll();
  closeMenuOnResize();
}

function closeModal(modal, itemCards) {
  const closeBtn = document.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    // on click on close button closing modal
    modal.classList.remove('active');
    document.querySelector('.modal-overlay').classList.remove('active');
    document.body.style.overflowY = 'scroll';
    window.removeEventListener('click', modalClickHandler);
  });
  // custom click handler for not closing modal, if was clicked on modal on another card from menu section
  let modalClickHandler = (event) => {
    if (!modal.contains(event.target)) {
      modal.classList.remove('active');
      document.querySelector('.modal-overlay').classList.remove('active');
      document.body.style.overflowY = 'scroll';
      window.removeEventListener('click', modalClickHandler);
    }
  };

  setTimeout(() => {
    if (modal.classList.contains('active')) {
      window.addEventListener('click', modalClickHandler);
    }
  }, 50);
}
