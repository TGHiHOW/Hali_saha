let activeBox = null;
let selectedArrayElement = null;
let offsetX = 0;
let offsetY = 0;
let boxId = 1;
let playersArray = []; 

const imageDivElement = document.getElementById("image-div");
const createPlayerButton = document.getElementById("create-player");
const arrayDiv = document.querySelector(".player-array");
const deletePlayerButton = document.getElementById("delete-player");
const saveButton = document.querySelector(".saveButton");
const resetButton = document.querySelector(".resetButton");


if (resetButton) {
    resetButton.addEventListener("click", () => {
        if (confirm("Tüm oyuncuları ve kadroyu tamamen sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
            resetGameState();
        }
    });
}

if (saveButton) {
    saveButton.addEventListener("click", () => {
        saveGameState();
    });
}


function checkAccessible(name, surname, phoneNumber) {
    if (name.value === "" || surname.value === "" || phoneNumber.value === "") {
        return false;
    } else {
        return true;
    }
}

deletePlayerButton.addEventListener("click", () => {
    if (!selectedArrayElement) {
        alert("Lütfen silmek için listeden bir oyuncu seçin!");
        return;
    }
    const playerId = Number(selectedArrayElement.dataset.id);

    // DÜZELTME: Indeks yerine .find() ile doğru objeyi ID'sine göre buluyoruz
    const playerObj = playersArray.find(player => player.player_id === playerId);
    const playerName = playerObj ? playerObj.player_name : "Seçilen";

    if(confirm(`${playerName} adlı oyuncuyu silmek istediğinize emin misiniz?`)){
        playersArray = playersArray.filter(player => player.player_id !== playerId);

        // B. Sahadaki görsel div'i siliyoruz
        const playerDivOnScreen = document.getElementById(`player-${playerId}`);
        if (playerDivOnScreen) {
            playerDivOnScreen.remove();
        }

        // C. Sağdaki listeden paragrafı siliyoruz
        selectedArrayElement.remove();

        // D. Seçimi sıfırlıyoruz
        selectedArrayElement = null;
        
        alert("Oyuncu başarıyla silindi.");
    }
});

createPlayerButton.addEventListener("click", () => {
    const playerNameElement = document.getElementById("name");
    const playerSurnameElement = document.getElementById("surname");
    const playerFirstPosition = document.getElementById("first-position");
    const playerSecondPosition = document.getElementById("second-position");
    const playerPhoneNumber = document.getElementById("phone-number");
    
    if (!checkAccessible(playerNameElement, playerSurnameElement, playerPhoneNumber)) {
        alert("Lütfen Oyuncu bilgilerini kontrol edin");
        return;
    }
    
    createPlayerDiv(
        playerNameElement, 
        playerSurnameElement, 
        playerFirstPosition, 
        playerSecondPosition, 
        playerPhoneNumber
    );

    makeArrayToParagraph();
});

function createPlayerDiv(name, surname, firstposition, secondposition, phoneNumber) {
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("player-div");
    playerDiv.id = `player-${boxId}`;

    const player = {
        player_id: boxId,
        player_name: name.value,
        player_surname: surname.value,
        player_first_position: firstposition.value,
        player_second_position: secondposition.value,
        player_phone_number: phoneNumber.value
    };

    playersArray.push(player);
    boxId++;

    // Başlangıç konumu
    playerDiv.style.left = "20px";
    playerDiv.style.top = "20px";

    const leftSide = document.createElement("div");
    leftSide.classList.add("player-left");
    leftSide.style.backgroundColor = choseColor(firstposition);

    const middleContent = document.createElement("div");
    middleContent.classList.add("player-medium");
    middleContent.textContent = `${name.value} ${surname.value}`;

    const rightSide = document.createElement("div");
    rightSide.classList.add("player-right");
    rightSide.style.backgroundColor = choseColor(secondposition);

    playerDiv.appendChild(leftSide);
    playerDiv.appendChild(middleContent);
    playerDiv.appendChild(rightSide);

    // Sürükle-bırak (Pointer Down) olayı
    playerDiv.addEventListener("pointerdown", (e) => {
        activeBox = playerDiv;
        const rect = playerDiv.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        playerDiv.style.cursor = "grabbing";
        playerDiv.setPointerCapture(e.pointerId);
    });

    imageDivElement.appendChild(playerDiv);

    function choseColor(position) {
        switch (position.value) {
            case "kale": return '#48f20b';
            case "defans": return '#0d1bee';
            case "orta-saha": return '#fdf82a';
            case "forvet": return '#ff0f0f';
            default: return '#ccc';
        }
    }
}

// Hareket ettirme (Pointer Move)
document.addEventListener("pointermove", (e) => {
    if (!activeBox) return;

    const parentRect = imageDivElement.getBoundingClientRect();
    let x = e.clientX - parentRect.left - offsetX;
    let y = e.clientY - parentRect.top - offsetY;

    x = Math.max(0, Math.min(x, imageDivElement.clientWidth - activeBox.clientWidth));
    y = Math.max(0, Math.min(y, imageDivElement.clientHeight - activeBox.clientHeight));

    activeBox.style.left = `${x}px`;
    activeBox.style.top = `${y}px`;
});

// Bırakma (Pointer Up)
document.addEventListener("pointerup", (e) => {
    if (activeBox) {
        activeBox.style.cursor = "grab";
        try {
            activeBox.releasePointerCapture(e.pointerId);
        } catch (err) {}
        activeBox = null;
    }
});

function makeArrayToParagraph(){
    const newP = document.createElement("p");
    newP.classList.add("player-array-value");
    const sonOyuncu = playersArray[playersArray.length - 1];
    
    newP.textContent = `${sonOyuncu.player_name} ${sonOyuncu.player_surname} Favori pozisyonu: ${sonOyuncu.player_first_position} Yedek pozisyonu: ${sonOyuncu.player_second_position} (Tel: ${sonOyuncu.player_phone_number})`;
    
    newP.dataset.id = sonOyuncu.player_id;

    newP.addEventListener("click", (e) => {
        if (selectedArrayElement) {
            selectedArrayElement.classList.remove("active");
        }

        newP.classList.add("active");

        selectedArrayElement = newP;
        console.log("Seçilen Oyuncu ID:", newP.dataset.id);
    });

    arrayDiv.appendChild(newP);
}

// Sayfanın Anlık Durumunu Kaydetme Fonksiyonu
function saveGameState() {
    // playersArray içindeki her bir oyuncunun anlık ekran koordinatlarını (top, left) güncelle
    const savedPlayers = playersArray.map(player => {
        const playerDivOnScreen = document.getElementById(`player-${player.player_id}`);
        return {
            ...player,
            posX: playerDivOnScreen ? playerDivOnScreen.style.left : "20px",
            posY: playerDivOnScreen ? playerDivOnScreen.style.top : "20px"
        };
    });

    // Verileri ve boxId değerini localStorage'a kaydediyoruz
    localStorage.setItem("haliSahaPlayers", JSON.stringify(savedPlayers));
    localStorage.setItem("haliSahaBoxId", boxId.toString());

    alert("Kadro ve oyuncu konumları başarıyla kaydedildi!");
}

// Kaydedilmiş Durumu Yükleme Fonksiyonu (Sayfa Açıldığında Çalışır)
function loadGameState() {
    const savedData = localStorage.getItem("haliSahaPlayers");
    const savedBoxId = localStorage.getItem("haliSahaBoxId");

    if (savedData) {
        const loadedPlayers = JSON.parse(savedData);
        if (savedBoxId) boxId = parseInt(savedBoxId, 10);

        loadedPlayers.forEach(player => {
            // 1. Diziye tekrar ekle
            playersArray.push(player);

            // 2. Sahada Div Oluştur
            const playerDiv = document.createElement("div");
            playerDiv.classList.add("player-div");
            playerDiv.id = `player-${player.player_id}`;
            playerDiv.style.left = player.posX || "20px";
            playerDiv.style.top = player.posY || "20px";

            const leftSide = document.createElement("div");
            leftSide.classList.add("player-left");
            leftSide.style.backgroundColor = getPositionColor(player.player_first_position);

            const middleContent = document.createElement("div");
            middleContent.classList.add("player-medium");
            middleContent.textContent = `${player.player_name} ${player.player_surname}`;

            const rightSide = document.createElement("div");
            rightSide.classList.add("player-right");
            rightSide.style.backgroundColor = getPositionColor(player.player_second_position);

            playerDiv.appendChild(leftSide);
            playerDiv.appendChild(middleContent);
            playerDiv.appendChild(rightSide);

            // Sürükleme olayı bağla
            playerDiv.addEventListener("pointerdown", (e) => {
                activeBox = playerDiv;
                const rect = playerDiv.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                playerDiv.style.cursor = "grabbing";
                playerDiv.setPointerCapture(e.pointerId);
            });

            imageDivElement.appendChild(playerDiv);

            // 3. Sağdaki Listeye Paragraf Ekle
            const newP = document.createElement("p");
            newP.classList.add("player-array-value");
            newP.textContent = `${player.player_name} ${player.player_surname} Favori pozisyonu: ${player.player_first_position} Yedek pozisyonu: ${player.player_second_position} (Tel: ${player.player_phone_number})`;
            newP.dataset.id = player.player_id;

            newP.addEventListener("click", () => {
                if (selectedArrayElement) {
                    selectedArrayElement.classList.remove("active");
                }
                newP.classList.add("active");
                selectedArrayElement = newP;
            });

            arrayDiv.appendChild(newP);
        });
    }
}

function resetGameState() {
    // 1. Hafızadaki dizi ve değişkenleri sıfırla
    playersArray = [];
    boxId = 1;
    selectedArrayElement = null;
    activeBox = null;

    // 2. LocalStorage verisini sil
    localStorage.removeItem("haliSahaPlayers");
    localStorage.removeItem("haliSahaBoxId");

    // 3. Sahadaki tüm oyuncu divlerini temizle
    imageDivElement.innerHTML = "";

    // 4. Sağ taraftaki oyuncu listesini temizle
    arrayDiv.innerHTML = "";

    alert("Tüm veriler ve saha başarıyla sıfırlandı.");
}

// Pozisyon Rengi Yardımcı Fonksiyonu
function getPositionColor(positionValue) {
    switch (positionValue) {
        case "kale": return '#48f20b';
        case "defans": return '#0d1bee';
        case "orta-saha": return '#fdf82a';
        case "forvet": return '#ff0f0f';
        default: return '#ccc';
    }
}

// Sayfa ilk yüklendiğinde otomatik olarak kayıtlı verileri getir
document.addEventListener("DOMContentLoaded", () => {
    loadGameState();
});