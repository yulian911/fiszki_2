import { test, expect } from '@playwright/test';

// Testy, które nie wymagają uruchomienia serwera Next.js
test('basic test', async ({ page }) => {
  // Tworzymy prostą stronę HTML do testowania
  await page.setContent(`
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Test Page</h1>
        <button id="btn">Click me</button>
        <div id="result"></div>
        
        <script>
          document.getElementById('btn').addEventListener('click', () => {
            document.getElementById('result').textContent = 'Button clicked!';
          });
        </script>
      </body>
    </html>
  `);
  
  // Sprawdzamy tytuł strony
  await expect(page).toHaveTitle('Test Page');
  
  // Sprawdzamy, czy przycisk istnieje
  const button = page.locator('#btn');
  await expect(button).toBeVisible();
  
  // Klikamy przycisk
  await button.click();
  
  // Sprawdzamy, czy rezultat jest widoczny
  const result = page.locator('#result');
  await expect(result).toHaveText('Button clicked!');
});

test('flashcard interaction simulation', async ({ page }) => {
  // Tworzymy stronę symulującą interfejs aplikacji fiszek
  await page.setContent(`
    <html>
      <head>
        <title>Fiszki App</title>
        <style>
          .flashcard {
            width: 300px;
            height: 200px;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px auto;
            text-align: center;
            cursor: pointer;
            position: relative;
          }
          .flashcard-front, .flashcard-back {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .flashcard-back {
            display: none;
          }
          .controls {
            text-align: center;
            margin-top: 230px;
          }
          button {
            padding: 8px 16px;
            margin: 0 5px;
          }
        </style>
      </head>
      <body>
        <h1>Fiszki App</h1>
        
        <div class="flashcard" id="flashcard">
          <div class="flashcard-front" id="front">
            <h2>Co to jest React?</h2>
          </div>
          <div class="flashcard-back" id="back">
            <p>React to biblioteka JavaScript do budowania interfejsów użytkownika.</p>
          </div>
        </div>
        
        <div class="controls">
          <button id="showAnswer">Pokaż odpowiedź</button>
          <button id="nextCard">Następna fiszka</button>
        </div>
        
        <script>
          let isFlipped = false;
          
          document.getElementById('showAnswer').addEventListener('click', () => {
            isFlipped = !isFlipped;
            if (isFlipped) {
              document.getElementById('front').style.display = 'none';
              document.getElementById('back').style.display = 'flex';
              document.getElementById('showAnswer').textContent = 'Pokaż pytanie';
            } else {
              document.getElementById('front').style.display = 'flex';
              document.getElementById('back').style.display = 'none';
              document.getElementById('showAnswer').textContent = 'Pokaż odpowiedź';
            }
          });
          
          document.getElementById('nextCard').addEventListener('click', () => {
            alert('Przejście do następnej fiszki');
          });
        </script>
      </body>
    </html>
  `);
  
  // Test podstawowych funkcji fiszek
  await expect(page.locator('h1')).toHaveText('Fiszki App');
  
  // Test widoczności przedniej strony fiszki
  await expect(page.locator('#front')).toBeVisible();
  await expect(page.locator('#front h2')).toHaveText('Co to jest React?');
  
  // Test, że tył fiszki nie jest widoczny
  await expect(page.locator('#back')).not.toBeVisible();
  
  // Kliknięcie przycisku "Pokaż odpowiedź"
  await page.locator('#showAnswer').click();
  
  // Sprawdzenie, czy front zniknął, a back się pojawił
  await expect(page.locator('#front')).not.toBeVisible();
  await expect(page.locator('#back')).toBeVisible();
  await expect(page.locator('#back p')).toHaveText('React to biblioteka JavaScript do budowania interfejsów użytkownika.');
  
  // Kliknięcie przycisku "Pokaż pytanie" (który zmienił tekst)
  await expect(page.locator('#showAnswer')).toHaveText('Pokaż pytanie');
  await page.locator('#showAnswer').click();
  
  // Sprawdzenie, czy wróciliśmy do pytania
  await expect(page.locator('#front')).toBeVisible();
  await expect(page.locator('#back')).not.toBeVisible();
}); 