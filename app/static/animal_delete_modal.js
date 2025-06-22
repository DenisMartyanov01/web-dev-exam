'use strict';

function modalShown(event) {

    let button = event.relatedTarget;
    let animalId = button.dataset.animalId;
    let animalName = button.dataset.animalName;
    let newUrl = `/main/${animalId}/delete`;
    let form = document.getElementById('deleteModalForm');
    form.action = newUrl;
    document.getElementById("modaltext").textContent = "Вы действительно хотите удалить животное " + animalName + "?";
}

let modal = document.getElementById('deleteModal');
modal.addEventListener('show.bs.modal', modalShown);
