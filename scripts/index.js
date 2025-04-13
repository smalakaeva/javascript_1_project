import { getProfileData, getCards } from "./api.js";

// Загрузка данных
Promise.all([getProfileData(), getCards()])
  .then(([userData, cards]) => {
    // Заполнение профиля
    profileTitle.textContent = userData.name;
    profileDesc.textContent = userData.about;

    // Отрисовка карточек
    cards.forEach((card) => {
      placesList.append(createCard(card));
    });
  })
  .catch((err) => console.error(err));

// Функция проверки ответа сервера
function checkResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Ошибка: ${res.status}`);
}

// Загрузка данных профиля с сервера
function fetchProfileData() {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  }).then(checkResponse);
}

// Загрузка карточек с сервера
function fetchCards() {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  }).then(checkResponse);
}

// Обновление данных профиля на сервере
function updateProfileData(name, about) {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name: name,
      about: about,
    }),
  }).then(checkResponse);
}

// Добавление новой карточки на сервер
function addNewCard(name, link) {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      name: name,
      link: link,
    }),
  }).then(checkResponse);
}

// @todo: DOM узлы
const profilePopup = document.querySelector(".popup_type_edit");
const cardPopup = document.querySelector(".popup_type_new-card");
const imagePopup = document.querySelector(".popup_type_image");

const popupImage = imagePopup.querySelector(".popup__image");
const popupCaption = imagePopup.querySelector(".popup__caption");
const closeImagePopupButton = imagePopup.querySelector(".popup__close");

const buttonProfileEdit = document.querySelector(".profile__edit-button"); // Кнопка редактирования профиля
const buttonProfileAdd = document.querySelector(".profile__add-button"); // Кнопка добавления карточки

//делает модальные окна отрытыми
function openModal(popup) {
  popup.classList.add("popup_is-opened");
}
function closeModal(popup) {
  popup.classList.remove("popup_is-opened");
}
buttonProfileEdit.addEventListener("click", () => openModal(profilePopup));
buttonProfileAdd.addEventListener("click", () => openModal(cardPopup));

const profileFormElement = document.querySelector(".popup_type_edit");
const nameInput = document.querySelector(".popup__input_type_name");
const jobInput = document.querySelector(".popup__input_type_description");

const profileTitle = document.querySelector(".profile__title");
const profileDesc = document.querySelector(".profile__description");

// Обработчик «отправки» формы, хотя пока
// она никуда отправляться не будет
function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = "Сохранение...";

  updateProfile(nameInput.value, jobInput.value)
    .then((data) => {
      profileTitle.textContent = data.name;
      profileDesc.textContent = data.about;
      closeModal(profilePopup);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
}
profileFormElement.addEventListener("submit", handleProfileFormSubmit);

document.querySelectorAll(".popup__close").forEach((closeButton) => {
  closeButton.addEventListener("click", (event) => {
    const popup = event.target.closest(".popup");
    closeModal(popup);
  });
});

const cardFormElement = document.querySelector(
  ".popup_type_new-card .popup__form"
);
const cardName = document.querySelector(".popup__input_type_card-name");
const card_img_url = document.querySelector(".popup__input_type_url");

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = "Создание...";

  addCard(cardName.value, card_img_url.value)
    .then((card) => {
      placesList.prepend(createCard(card));
      cardFormElement.reset();
      closeModal(cardPopup);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      submitButton.textContent = "Создать";
    });
}
// Прикрепляем обработчик к форме:он будет следить за событием “submit” - «отправка»
cardFormElement.addEventListener("submit", handleCardFormSubmit);

// @todo: Темплейт карточки
const placesList = document.querySelector(".places__list");
const cardTemplate = document.querySelector("#card-template").content;

// @todo: Функция создания карточки
function createCard(cardData, currentUserId) {
  const cardElement = cardTemplate.cloneNode(true);
  const card = cardElement.querySelector(".card");
  const cardImage = card.querySelector(".card__image");
  const cardTitle = card.querySelector(".card__title");
  const likeButton = card.querySelector(".card__like-button");
  const deleteButton = card.querySelector(".card__delete-button");
  const likeCounter = card.querySelector(".card__like-counter");

  // Заполняем данные карточки
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCounter.textContent = cardData.likes.length;

  // Проверяем, лайкнул ли текущий пользователь карточку
  const isLiked = cardData.likes.some((like) => like._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Удаление карточки (только для своих карточек)
  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      deleteCard(cardData._id)
        .then(() => card.remove())
        .catch((err) => console.error("Ошибка удаления:", err));
    });
  }

  // Обработчик лайков
  likeButton.addEventListener("click", () => {
    const likeAction = isLiked
      ? unlikeCard(cardData._id)
      : likeCard(cardData._id);

    likeAction
      .then((updatedCard) => {
        likeCounter.textContent = updatedCard.likes.length;
        likeButton.classList.toggle("card__like-button_is-active");
      })
      .catch((err) => console.error("Ошибка лайка:", err));
  });

  // Открытие попапа с изображением
  cardImage.addEventListener("click", () =>
    openImagePopup(cardData.name, cardData.link)
  );

  return card;
}

// @todo: Вывести карточки на страницу
function renderCards() {
  fetchCards()
    .then((cards) => {
      cards.forEach((cardData) => {
        const card = createCard(cardData);
        placesList.append(card);
      });
    })
    .catch((err) => console.error(err));
}
renderCards();
// Загрузка данных при открытии страницы
Promise.all([fetchProfileData(), fetchCards()])
  .then(([userData, cards]) => {
    profileTitle.textContent = userData.name;
    profileDesc.textContent = userData.about;

    cards.forEach((cardData) => {
      const card = createCard(cardData);
      placesList.append(card);
    });
  })
  .catch((err) => console.error(err));

function openImagePopup(name, link) {
  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;
  openModal(imagePopup);
}

const avatarPopup = document.querySelector(".popup_type_avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarUrlInput = avatarPopup.querySelector(
  ".popup__input_type_avatar-url"
);

// Открытие попапа
profileAvatar.addEventListener("click", () => openModal(avatarPopup));

// Отправка формы
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = "Сохранение...";

  updateAvatar(avatarUrlInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarPopup);
      avatarForm.reset();
    })
    .catch((err) => console.error(err))
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
});

// Проект 2
//1. Валидация формы «Редактировать профиль»
const profileForm = document.querySelector(".popup__form");
const formInputs = profileForm.querySelectorAll(".popup__input");

// Функция показа ошибки
function showInputError(input, errorMessage) {
  const formError = profileForm.querySelector(`.${input.id}-error`);
  input.classList.add("form__input_type_error");
  formError.textContent = errorMessage;
  formError.classList.add("form__input-error_active");
}

// Функция скрытия ошибки
function hideInputError(input) {
  const formError = profileForm.querySelector(`.${input.id}-error`);
  input.classList.remove("form__input_type_error");
  formError.classList.remove("form__input-error_active");
  formError.textContent = "";
}

// Функция проверки валидности
function isValid(input) {
  if (!input.validity.valid) {
    showInputError(input, input.validationMessage);
  } else {
    hideInputError(input);
  }
}

// Добавляем слушатели на все поля
formInputs.forEach(function (input) {
  input.addEventListener("input", function () {
    isValid(input);
  });
});
