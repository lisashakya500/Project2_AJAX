document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('fetchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const input = document.getElementById('userInput');
    const display = document.getElementById('display');
    const status = document.getElementById('status');
    const historyPanel = document.getElementById('historyPanel');
    const showFavsBtn = document.getElementById('showFavsBtn');
    const themeToggle = document.getElementById('themeToggle');

    let history = JSON.parse(localStorage.getItem('history')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let results = [];
    let showFavs = false;

    /* =====================
       THEME 
    ===================== */

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }

    themeToggle.addEventListener('click', () => {

        document.body.classList.toggle('dark');

        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark')
                ? 'dark'
                : 'light'
        );
    });

    /* =====================
       SEARCH
    ===================== */

    btn.addEventListener('click', searchShows);

    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') searchShows();
    });

    async function searchShows() {

        const query = input.value.trim();
        if (!query) return;

        status.textContent = "Loading...";

        const res = await fetch(
            `https://api.tvmaze.com/search/shows?q=${query}`
        );

        const data = await res.json();

        results = data;

        history = [query, ...history.filter(h => h !== query)].slice(0, 5);

        localStorage.setItem('history', JSON.stringify(history));

        renderHistory();

        render(data);
    }

    /* =====================
       HISTORY
    ===================== */

    function renderHistory() {

        historyPanel.innerHTML = history.map(h =>
            `<button onclick="historyClick('${h}')">${h}</button>`
        ).join('');
    }

    window.historyClick = (q) => {

        input.value = q;

        searchShows();
    };

    /* =====================
       RENDER
    ===================== */

    function render(data) {

        status.textContent = `${data.length} results`;

        display.innerHTML = data.map(item => {

            const s = item.show;

            const isFav = favorites.some(f => f.id === s.id);

            return `
                <div class="card">

                    <img src="${s.image?.medium || ''}">

                    <div class="card-body">

                        <h4>${s.name}</h4>

                        <div class="info">
                            <span>⭐ ${s.rating?.average || 'N/A'}</span>
                            <span>${s.premiered?.slice(0, 4) || ''}</span>
                        </div>

                        <div>
                            ${(s.genres || []).map(g =>
                `<span class="genre-tag">${g}</span>`
            ).join('')}
                        </div>

                        <button class="fav-btn ${isFav ? 'active' : ''}"
                            onclick="toggleFav(${s.id})">

                            ${isFav ? "❤️ Remove" : "🤍 Favorite"}

                        </button>

                    </div>

                </div>
            `;
        }).join('');
    }

    /* =====================
       FAVORITES 
    ===================== */

    window.toggleFav = (id) => {

        const found = results.find(r => r.show.id === id);

        const exists = favorites.find(f => f.id === id);

        if (exists) {

            favorites = favorites.filter(f => f.id !== id);

        } else if (found) {

            favorites.push(found.show);
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));

        render(showFavs
            ? favorites.map(f => ({ show: f }))
            : results
        );
    };

    showFavsBtn.addEventListener('click', () => {

        showFavs = !showFavs;

        render(showFavs
            ? favorites.map(f => ({ show: f }))
            : results
        );
    });

    /* =====================
       CLEAR
    ===================== */

    clearBtn.addEventListener('click', () => {

        input.value = "";
        display.innerHTML = "";
        status.textContent = "Ready";

    });

});