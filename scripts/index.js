import {
  getProfileData,
  getCards,
  updateProfile,
  addCard,
  deleteCard,
  likeCard,
  unlikeCard,
  updateAvatar,
} from "./api.js";

// DOM элементы
const profileTitle = document.querySelector(".profile__title");
const profileDesc = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const placesList = document.querySelector(".places__list");

// Попапы
const profilePopup = document.querySelector(".popup_type_edit");
const cardPopup = document.querySelector(".popup_type_new-card");
const imagePopup = document.querySelector(".popup_type_image");
const avatarPopup = document.querySelector(".popup_type_avatar");

// Формы
const profileForm = document.querySelector('[name="edit-profile"]');
const cardForm = document.querySelector('[name="new-place"]');
const avatarForm = document.querySelector('[name="edit-avatar"]');

// Инпуты
const nameInput = document.querySelector(".popup__input_type_name");
const jobInput = document.querySelector(".popup__input_type_description");
const avatarUrlInput = document.querySelector(".popup__input_type_avatar-url");

// Кнопки
const editButton = document.querySelector(".profile__edit-button");
const addButton = document.querySelector(".profile__add-button");
const avatarEditButton = document.querySelector(".profile__image-edit-button");

// Элементы попапа изображения
const popupImage = imagePopup.querySelector(".popup__image");
const popupCaption = imagePopup.querySelector(".popup__caption");

// Шаблон карточки
const cardTemplate = document.querySelector("#card-template").content;

// Функции работы с попапами
function openModal(popup) {
  popup.classList.add("popup_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(popup) {
  popup.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) closeModal(openedPopup);
  }
}

// Обработчики закрытия попапов
document.querySelectorAll(".popup").forEach((popup) => {
  popup.addEventListener("mousedown", (evt) => {
    if (
      evt.target.classList.contains("popup_is-opened") ||
      evt.target.classList.contains("popup__close")
    ) {
      closeModal(popup);
    }
  });
});

// Функция создания карточки
function createCard(cardData, currentUserId) {
  const cardElement = cardTemplate.cloneNode(true);
  const card = cardElement.querySelector(".card");
  const cardImage = card.querySelector(".card__image");
  const cardTitle = card.querySelector(".card__title");
  const likeButton = card.querySelector(".card__like-button");
  const deleteButton = card.querySelector(".card__delete-button");
  const likeCounter = card.querySelector(".card__like-counter");

  // Заполнение данных
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCounter.textContent = cardData.likes.length;

  // Проверка лайков
  const isLiked = cardData.likes.some((like) => like._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Удаление карточки
  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      deleteCard(cardData._id)
        .then(() => card.remove())
        .catch((err) => console.error("Ошибка удаления:", err));
    });
  }

  // Обработчик лайка
  likeButton.addEventListener("click", () => {
    const likeAction = likeButton.classList.contains(
      "card__like-button_is-active"
    )
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
  cardImage.addEventListener("click", () => {
    popupImage.src = cardData.link;
    popupImage.alt = cardData.name;
    popupCaption.textContent = cardData.name;
    openModal(imagePopup);
  });

  return cardElement;
}

// Валидация форм
function showInputError(formElement, inputElement, errorMessage) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.add("popup__input_type_error");
  errorElement.textContent = errorMessage;
  errorElement.classList.add("popup__input-error_active");
}

function hideInputError(formElement, inputElement) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.remove("popup__input_type_error");
  errorElement.classList.remove("popup__input-error_active");
  errorElement.textContent = "";
}

function checkInputValidity(formElement, inputElement) {
  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage);
  } else {
    hideInputError(formElement, inputElement);
  }
}

function hasInvalidInput(inputList) {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  });
}

function toggleButtonState(inputList, buttonElement) {
  if (hasInvalidInput(inputList)) {
    buttonElement.disabled = true;
    buttonElement.classList.add("popup__button_disabled");
  } else {
    buttonElement.disabled = false;
    buttonElement.classList.remove("popup__button_disabled");
  }
}

function setEventListeners(formElement) {
  const inputList = Array.from(formElement.querySelectorAll(".popup__input"));
  const buttonElement = formElement.querySelector(".popup__button");

  // Активируем кнопку при открытии попапа аватара
  if (formElement === avatarForm) {
    buttonElement.disabled = false;
    buttonElement.classList.remove("popup__button_disabled");
  }

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement);
      toggleButtonState(inputList, buttonElement);
    });
  });
}

// Включение валидации всех форм
document.querySelectorAll(".popup__form").forEach(setEventListeners);

// Загрузка начальных данных
let currentUserId;

Promise.all([getProfileData(), getCards()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDesc.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesList.append(createCard(cardData, currentUserId));
    });
  })
  .catch((err) => console.error("Ошибка загрузки данных:", err));

// Обработчики открытия попапов
editButton.addEventListener("click", () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDesc.textContent;
  openModal(profilePopup);
});

addButton.addEventListener("click", () => {
  cardForm.reset();
  openModal(cardPopup);
});

avatarEditButton.addEventListener("click", () => {
  avatarForm.reset();
  // Активируем кнопку при открытии попапа
  const avatarSubmitButton = avatarForm.querySelector(".popup__button");
  avatarSubmitButton.disabled = false;
  avatarSubmitButton.classList.remove("popup__button_disabled");
  openModal(avatarPopup);
});

// Обработчики отправки форм
profileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = "Сохранение...";

  updateProfile(nameInput.value, jobInput.value)
    .then((data) => {
      profileTitle.textContent = data.name;
      profileDesc.textContent = data.about;
      closeModal(profilePopup);
    })
    .catch((err) => console.error("Ошибка обновления профиля:", err))
    .finally(() => (submitButton.textContent = "Сохранить"));
});

cardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = "Создание...";

  const cardName = cardForm.querySelector(".popup__input_type_card-name").value;
  const cardUrl = cardForm.querySelector(".popup__input_type_url").value;

  addCard(cardName, cardUrl)
    .then((card) => {
      placesList.prepend(createCard(card, currentUserId));
      cardForm.reset();
      closeModal(cardPopup);
    })
    .catch((err) => console.error("Ошибка добавления карточки:", err))
    .finally(() => (submitButton.textContent = "Создать"));
});

// Обработчик обновления аватара
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = "Сохранение...";

  updateAvatar(avatarUrlInput.value)
    .then((data) => {
      profileAvatar.style.backgroundImage = `url(${data.avatar})`;
      closeModal(avatarPopup);
    })
    .catch((err) => console.error("Ошибка обновления аватара:", err))
    .finally(() => (submitButton.textContent = "Сохранить"));
});
