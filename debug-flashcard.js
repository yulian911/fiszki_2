// 🔍 FLASHCARD DEBUG SCRIPT - wklej w konsoli przeglądarki
console.clear();
console.log('🔍 FLASHCARD DEBUG SCRIPT');
console.log('========================');

// Znajdź główny kontener perspektywy
const perspective = document.querySelector('.perspective-1000');
if (!perspective) {
  console.error('❌ Nie znaleziono .perspective-1000');
} else {
  console.log('✅ Znaleziono perspective container');
}

// Znajdź główny kontener flip
const flipContainer = perspective?.querySelector('[class*="preserve-3d"]');
if (!flipContainer) {
  console.error('❌ Nie znaleziono flip container');
} else {
  console.log('✅ Znaleziono flip container');
  const rect = flipContainer.getBoundingClientRect();
  console.log(`📏 Flip container: ${rect.width}px × ${rect.height}px`);
}

// Znajdź karty (front i back)
const cards = document.querySelectorAll('[class*="backface-hidden"]');
console.log(`🃏 Znaleziono ${cards.length} kart`);

cards.forEach((card, index) => {
  const isBack = card.classList.contains('rotate-y-180');
  const side = isBack ? 'BACK (Answer)' : 'FRONT (Question)';
  
  console.log(`\n📋 KARTA ${index + 1} - ${side}`);
  console.log('=' + '='.repeat(side.length + 15));
  
  const rect = card.getBoundingClientRect();
  console.log(`📏 Rozmiar karty: ${rect.width}px × ${rect.height}px`);
  
  // Sprawdź CardContent
  const cardContent = card.querySelector('[class*="p-6"]');
  if (cardContent) {
    const contentRect = cardContent.getBoundingClientRect();
    console.log(`📄 CardContent: ${contentRect.width}px × ${contentRect.height}px`);
    
    // Sprawdź sekcje
    const sections = cardContent.children;
    console.log(`📦 Sekcji w karcie: ${sections.length}`);
    
    Array.from(sections).forEach((section, i) => {
      const sectionRect = section.getBoundingClientRect();
      const classes = section.className;
      
      // Określ typ sekcji na podstawie klas
      let type = 'Unknown';
      if (classes.includes('h-12')) type = 'HEADER';
      else if (classes.includes('h-48')) type = 'CONTENT';
      else if (classes.includes('h-16')) type = 'FOOTER';
      
      console.log(`  📐 ${type}: ${sectionRect.width}px × ${sectionRect.height}px`);
      
      if (classes.includes('bg-')) {
        const bgClass = classes.split(' ').find(c => c.startsWith('bg-'));
        console.log(`  🎨 Background: ${bgClass}`);
      }
    });
  }
});

// Sprawdź custom CSS
const flashcardContent = document.querySelectorAll('.flashcard-content');
console.log(`\n✨ CUSTOM CSS`);
console.log('=============');
console.log(`📝 .flashcard-content elements: ${flashcardContent.length}`);

flashcardContent.forEach((element, index) => {
  const styles = window.getComputedStyle(element);
  console.log(`📋 Element ${index + 1}:`);
  console.log(`  Font-size: ${styles.fontSize}`);
  console.log(`  Line-height: ${styles.lineHeight}`);
  console.log(`  Text-align: ${styles.textAlign}`);
  console.log(`  Font-weight: ${styles.fontWeight}`);
});

// Sprawdź czy animacja działa
const isFlipped = flipContainer?.classList.contains('rotate-y-180');
console.log(`\n🔄 ANIMACJA`);
console.log('===========');
console.log(`Karta przekręcona: ${isFlipped ? 'TAK' : 'NIE'}`);

// Dodatkowe info
console.log(`\n💻 ŚRODOWISKO`);
console.log('=============');
console.log(`Szerokość okna: ${window.innerWidth}px`);
console.log(`Wysokość okna: ${window.innerHeight}px`);
console.log(`User Agent: ${navigator.userAgent}`);

console.log('\n🎯 DEBUGGING ZAKOŃCZONY');
console.log('Skopiuj powyższe info i wyślij! 📋'); 