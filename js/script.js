
function SearchRecipe(event) {
    if (event.keyCode !== 13 && event.target.className !== 'ri-search-line') return;

    // Input Elements
    var recipeSearchElement = document.getElementById('recipe_search');

    if (recipeSearchElement.value === '') return;

    // Output Elements
    var resultsContainer = document.getElementById('results_div-id');

    // Api Call
    var api_link = `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipeSearchElement.value}`;
    fetch(api_link)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then(data => {
            // Clear previous results
            resultsContainer.innerHTML = '';

            if (data.meals === null) {
                // Display no results message
                var noResultsMessage = document.createElement('p');
                noResultsMessage.classList.add('no-results-message');
                noResultsMessage.innerText = 'No meals found for your search.';
                resultsContainer.appendChild(noResultsMessage);
            }
            else {
                // Display results
                data.meals.forEach(meal => {
                    var resultElement = document.createElement('div');
                    resultElement.classList.add('result');

                    var imgDiv = document.createElement('div');
                    imgDiv.classList.add('result-img_div');

                    var imgElement = document.createElement('img');
                    imgElement.classList.add('result_img');
                    imgElement.src = meal.strMealThumb;
                    imgElement.alt = 'Food image.';

                    imgDiv.appendChild(imgElement);

                    var textDiv = document.createElement('div');
                    textDiv.classList.add('result-text_div');

                    var h1Element = document.createElement('h1');
                    h1Element.classList.add('result-text_h1');
                    h1Element.innerText = `"${meal.strMeal.substr(0, 43)}${meal.strMeal.length > 43 ? '...' : ''}"`;


                    var p1Element = document.createElement('p');
                    p1Element.classList.add('result-text_p');
                    var strong1Element = document.createElement('strong');
                    strong1Element.classList.add('result-text_strong');
                    strong1Element.innerText = 'Category';
                    p1Element.appendChild(strong1Element);
                    p1Element.innerHTML += `: ${meal.strCategory}`;

                    var p2Element = document.createElement('p');
                    p2Element.classList.add('result-text_p');
                    var strong2Element = document.createElement('strong');
                    strong2Element.classList.add('result-text_strong');
                    strong2Element.innerText = 'Origin';
                    p2Element.appendChild(strong2Element);
                    p2Element.innerHTML += `: ${meal.strArea}`;

                    var p3Element = document.createElement('p');
                    p3Element.classList.add('result-text_p');
                    var strong3Element = document.createElement('strong');
                    strong3Element.classList.add('result-text_strong');
                    strong3Element.innerText = 'Meal ID: ';
                    p3Element.appendChild(strong3Element);
                    p3Element.innerHTML += `${meal.idMeal}`;
                    p3Element.style.display = 'none';

                    textDiv.appendChild(h1Element);
                    textDiv.appendChild(p1Element);
                    textDiv.appendChild(p2Element);
                    textDiv.appendChild(p3Element);

                    resultElement.appendChild(imgDiv);
                    resultElement.appendChild(textDiv);

                    resultElement.addEventListener('click', function () {
                        var mealId = meal.idMeal;
                        LoadSelectedMeal(mealId);
                        console.log('Meal ID:', mealId);
                    });

                    resultsContainer.appendChild(resultElement);
                });
            }
        })
        .catch(error => {
            // Handle any errors
            console.log('Something went wrong.');
            console.error('Error:', error);
        });
}

function extractVideoId(url) {
    const videoId = url.split('?v=')[1];
    return videoId ? videoId : null;
}

function LoadSelectedMeal(mealId) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            const mealName = meal.strMeal;
            const category = meal.strCategory;
            const origin = meal.strArea;
            const instructions = meal.strInstructions;
            const ingredients = [];
            const measurements = [];

            // Extract all ingredients and measurements
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measurement = meal[`strMeasure${i}`];

                if (ingredient && ingredient.trim() !== '' && ingredient !== 'null') {
                    ingredients.push(ingredient);
                }

                if (measurement && measurement.trim() !== '' && measurement !== 'null') {
                    measurements.push(measurement);
                }
            }

            const mealImage = meal.strMealThumb;
            const videoUrl = meal.strYoutube;
            const videoId = extractVideoId(videoUrl);
            const embeddedVideoUrl = `https://www.youtube.com/embed/${videoId}`;

            var videoContainer = document.querySelector(".video_container");
            videoContainer.innerHTML = '<div class="video_div"><iframe id="video" class="video" src="" frameborder="0" allowfullscreen></iframe></div>';

            const resultContainer = document.querySelector('.result-view_container');
            const headerTextH1 = document.querySelector('.result-header-text_h1');
            const categoryText = document.querySelector('#result-header-text_p1');
            const originText = document.querySelector('#result-header-text_p2');
            const instructionsDiv = document.querySelector('.instructions_div');
            const ingredientsTable = document.querySelector('tbody');
            const videoIframe = document.querySelector('.video');
            const mealImageElement = document.querySelector('.result-header-image');

            headerTextH1.textContent = mealName;
            categoryText.innerHTML = `<strong>Category</strong>: ${category}`;
            originText.innerHTML = `<strong>Origin</strong>: ${origin}`;

            // Clear previous ingredients
            ingredientsTable.innerHTML = '';

            // Split instructions into separate steps
            const sentences = instructions.match(/[^.]+[.]/g);

            const instructionsHTML = sentences.map(sentence => `${sentence.trim()}<br>`).join('');

            instructionsDiv.innerHTML = `
                <h1>Instructions:</h1>
                ${instructionsHTML}
            `;

            // Fill in the ingredients and measurements in the table
            ingredients.forEach((ingredient, index) => {
                const measurement = measurements[index];
                const capitalizedIngredient = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
                const capitalizedMeasurement = measurement.charAt(0).toUpperCase() + measurement.slice(1);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${capitalizedIngredient}</td>
                    <td>${capitalizedMeasurement}</td>
                `;
                ingredientsTable.appendChild(row);
                document.body.style.overflow = 'hidden';
            });

            videoIframe.src = embeddedVideoUrl;
            mealImageElement.src = mealImage;

            var resultViewDivElement = document.querySelector('.result-view_div');
            var resultBodyDivElement = document.querySelector('.result-body_div');
            bodyScrollToTop();
            resultContainer.style.display = 'flex';
            elementScrollToTop(resultViewDivElement);
            elementScrollToTop(resultBodyDivElement);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function CloseResultView() {
    var videoContainer = document.querySelector(".video_container");
    videoContainer.innerHTML = "";
    var closeElement = document.getElementsByClassName('result-view_container');
    closeElement[0].style.display = 'none';
    document.body.style.overflow = 'auto';
}

function bodyScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function elementScrollToTop(element) {
    element.scrollTop = 0;
}

  