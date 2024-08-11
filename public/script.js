const searchInput = document.getElementById('Input');
const searchButton = document.querySelector('.search-box button');
const displaySearchList = document.getElementsByClassName('fav-container');


searchInput.addEventListener('input', findMovies);
searchButton.addEventListener('click', findMovies);

async function singleMovie() {
    const urlQueryParams = new URLSearchParams(window.location.search);
    const id = urlQueryParams.get('id');
    const response = await fetch(`/api/movies?i=${id}`);
    const data = await response.json();

    console.log(data);

    const output = `
        <div class="movie-poster">
            <img src="${data.Poster}" alt="Movie Poster">
        </div>
        <div class="movie-details">
            <div class="details-header">
                <div class="dh-ls">
                    <h2>${data.Title}</h2>
                </div>
                <div class="dh-rs">
                    <i class="fa-solid fa-bookmark" onClick="addTofavorites('${id}')" style="cursor: pointer;"></i>
                </div>
            </div>
            <span class="italics-text"><i>${data.Year} &#x2022; ${data.Country} &#x2022; Rating - <span
                        style="font-size: 18px; font-weight: 600;">${data.imdbRating}</span>/10 </i></span>
            <p style="font-size: 18px; font-style: italic; color: red; margin-top: 10px;">
                        <i class="fa-solid fa-award"></i>
                        &thinsp; ${data.Awards}
            </p>
            <ul class="details-ul">
                <li><strong>Actors: </strong>${data.Actors}</li>
                <li><strong>Director: </strong>${data.Director}</li>
                <li><strong>Writers: </strong>${data.Writer}</li>
            </ul>
            <ul class="details-ul">
                <li><strong>Genre: </strong>${data.Genre}</li>
                <li><strong>Release Date: </strong>${data.DVD}</li>
                <li><strong>Box Office: </strong>${data.BoxOffice}</li>
                <li><strong>Movie Runtime: </strong>${data.Runtime}</li>
            </ul>
            <p style="font-size: 14px; margin-top:10px;">${data.Plot}</p>
        </div> 
    `;
    document.querySelector('.movie-container').innerHTML = output;
}

async function findMovies() {
    const query = searchInput.value.trim();
    const response = await fetch(`/api/movies?s=${query}`);
    const data = await response.json();

    if (data.Search) {
        displayMovieList(data.Search);
    }
}

async function displayMovieList(movies) {
    let output = '';
    for (const movie of movies) {
        const img = movie.Poster !== 'N/A' ? movie.Poster : 'img/blank-poster.webp';
        const id = movie.imdbID;

        output += `
            <div class="fav-item">
                <div class="fav-poster">
                    <a href="movie.html?id=${id}"><img src="${img}" alt="Favourites Poster"></a>
                </div>
                <div class="fav-details">
                    <div class="fav-details-box">
                        <div>
                            <p class="fav-movie-name"><a href="movie.html?id=${id}">${movie.Title}</a></p>
                            <p class="fav-movie-rating"><a href="movie.html?id=${id}">${movie.Year}</a></p>
                        </div>
                        <div>
                            <i class="fa-solid fa-bookmark" style="cursor:pointer;" onClick="addTofavorites('${id}')"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    document.querySelector('.fav-container').innerHTML = output;
}

async function favoritesMovieLoader() {
    let output = '';
    for (const key in localStorage) {
        const id = localStorage.getItem(key);
        if (id) {
            const response = await fetch(`/api/movies?i=${id}`);
            const data = await response.json();
            console.log(data);

            const img = data.Poster || 'img/blank-poster.webp';
            const Id = data.imdbID;

            output += `
                <div class="fav-item">
                    <div class="fav-poster">
                        <a href="movie.html?id=${id}"><img src="${img}" alt="Favourites Poster"></a>
                    </div>
                    <div class="fav-details">
                        <div class="fav-details-box">
                            <div>
                                <p class="fav-movie-name">${data.Title}</p>
                                <p class="fav-movie-rating">${data.Year} &middot; <span style="font-size: 15px; font-weight: 600;">${data.imdbRating}</span>/10</p>
                            </div>
                            <div style="color: maroon">
                                <i class="fa-solid fa-trash" style="cursor:pointer;" onClick="removeFromfavorites('${Id}')"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    document.querySelector('.fav-container').innerHTML = output;
}

// Define your functions
function addTofavorites(movieId) {
    console.log(`Adding movie ${movieId} to favorites.`);
    localStorage.setItem(movieId, movieId);
}

function removeFromfavorites(movieId) {
    console.log(`Removing movie ${movieId} from favorites.`);
    localStorage.removeItem(movieId);
}
