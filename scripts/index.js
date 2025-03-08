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
  evt.preventDefault(); // Эта строчка отменяет стандартную отправку формы.

  profileTitle.textContent = nameInput.value;
  profileDesc.textContent = jobInput.value;

  closeModal(profilePopup);
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

  const newCard = createCard({
    name: cardName.value,
    link: card_img_url.value,
  });

  placesList.prepend(newCard); // Добавляем новую карточку ПЕРВОЙ в список

  cardFormElement.reset(); // Очищаем поля формы
  closeModal(cardPopup);
}
// Прикрепляем обработчик к форме:он будет следить за событием “submit” - «отправка»
cardFormElement.addEventListener("submit", handleCardFormSubmit);

// @todo: Темплейт карточки
const placesList = document.querySelector(".places__list");
const cardTemplate = document.querySelector("#card-template").content;

// @todo: Функция создания карточки
function createCard({ name, link }) {
  const cardElement = cardTemplate.cloneNode(true);
  const card = cardElement.firstElementChild; // Теперь это сама карточка

  const cardImage = card.querySelector(".card__image");
  const cardTitle = card.querySelector(".card__title");
  const likeButton = card.querySelector(".card__like-button");
  const deleteButton = card.querySelector(".card__delete-button");

  cardImage.src = link;
  cardImage.alt = name;
  cardTitle.textContent = name;

  // Лайк
  likeButton.addEventListener("click", (evt) => {
    evt.target.classList.toggle("card__like-button_is-active");
  });

  // @todo: Функция удаления карточки
  deleteButton.addEventListener("click", (evt) => {
    const cardToDelete = evt.target.closest(".card");
    if (cardToDelete) {
      cardToDelete.remove();
    }
  });

  //Просмотр карточки
  cardImage.addEventListener("click", () => openImagePopup(name, link));
  return card;
}
// @todo: Вывести карточки на страницу
function renderCards() {
  initialCards.forEach((cardData) => {
    const card = createCard(cardData);
    placesList.append(card);
  });
}
renderCards();

function openImagePopup(name, link) {
  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;
  openModal(imagePopup);
}
