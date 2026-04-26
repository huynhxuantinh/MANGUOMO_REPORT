export interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  translation: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    description: 'Từ vựng kinh doanh'
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    description: 'Từ vựng du lịch'
  },
  {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍽️',
    description: 'Từ vựng ẩm thực'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    description: 'Từ vựng công nghệ'
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    description: 'Từ vựng giáo dục'
  },
  {
    id: 'health',
    name: 'Health',
    icon: '🏥',
    description: 'Từ vựng y tế'
  }
];

export const vocabularyData: VocabularyWord[] = [
  // Business
  {
    id: '1',
    word: 'negotiate',
    pronunciation: '/nɪˈɡoʊ.ʃi.eɪt/',
    partOfSpeech: 'verb',
    definition: 'To discuss something in order to reach an agreement',
    example: 'We need to negotiate the terms of the contract.',
    translation: 'đàm phán, thương lượng',
    category: 'business'
  },
  {
    id: '2',
    word: 'revenue',
    pronunciation: '/ˈrev.ə.nuː/',
    partOfSpeech: 'noun',
    definition: 'Income generated from normal business operations',
    example: 'The company\'s revenue increased by 20% this year.',
    translation: 'doanh thu',
    category: 'business'
  },
  {
    id: '3',
    word: 'entrepreneur',
    pronunciation: '/ˌɑːn.trə.prəˈnɝː/',
    partOfSpeech: 'noun',
    definition: 'A person who starts and runs a business',
    example: 'She became a successful entrepreneur at a young age.',
    translation: 'doanh nhân',
    category: 'business'
  },
  {
    id: '4',
    word: 'collaborate',
    pronunciation: '/kəˈlæb.ə.reɪt/',
    partOfSpeech: 'verb',
    definition: 'To work together with others',
    example: 'Our teams will collaborate on this project.',
    translation: 'hợp tác',
    category: 'business'
  },
  {
    id: '5',
    word: 'budget',
    pronunciation: '/ˈbʌdʒ.ɪt/',
    partOfSpeech: 'noun',
    definition: 'A plan for spending money',
    example: 'We need to stay within our budget.',
    translation: 'ngân sách',
    category: 'business'
  },

  // Travel
  {
    id: '6',
    word: 'itinerary',
    pronunciation: '/aɪˈtɪn.ə.rer.i/',
    partOfSpeech: 'noun',
    definition: 'A planned route or journey',
    example: 'Please send me your travel itinerary.',
    translation: 'lịch trình',
    category: 'travel'
  },
  {
    id: '7',
    word: 'accommodation',
    pronunciation: '/əˌkɑː.məˈdeɪ.ʃən/',
    partOfSpeech: 'noun',
    definition: 'A place to live or stay',
    example: 'We need to book accommodation for the trip.',
    translation: 'chỗ ở',
    category: 'travel'
  },
  {
    id: '8',
    word: 'destination',
    pronunciation: '/ˌdes.tɪˈneɪ.ʃən/',
    partOfSpeech: 'noun',
    definition: 'The place to which someone is going',
    example: 'Paris is a popular tourist destination.',
    translation: 'điểm đến',
    category: 'travel'
  },
  {
    id: '9',
    word: 'embark',
    pronunciation: '/ɪmˈbɑːrk/',
    partOfSpeech: 'verb',
    definition: 'To begin a journey',
    example: 'We will embark on our adventure tomorrow.',
    translation: 'bắt đầu (hành trình)',
    category: 'travel'
  },
  {
    id: '10',
    word: 'souvenir',
    pronunciation: '/ˌsuː.vəˈnɪr/',
    partOfSpeech: 'noun',
    definition: 'A thing kept as a reminder of a place visited',
    example: 'I bought some souvenirs for my family.',
    translation: 'quà lưu niệm',
    category: 'travel'
  },

  // Food
  {
    id: '11',
    word: 'cuisine',
    pronunciation: '/kwɪˈziːn/',
    partOfSpeech: 'noun',
    definition: 'A style of cooking',
    example: 'I love Italian cuisine.',
    translation: 'ẩm thực',
    category: 'food'
  },
  {
    id: '12',
    word: 'delicious',
    pronunciation: '/dɪˈlɪʃ.əs/',
    partOfSpeech: 'adjective',
    definition: 'Having a very pleasant taste',
    example: 'This cake is absolutely delicious!',
    translation: 'ngon',
    category: 'food'
  },
  {
    id: '13',
    word: 'appetizer',
    pronunciation: '/ˈæp.ə.taɪ.zɚ/',
    partOfSpeech: 'noun',
    definition: 'A small dish served before the main course',
    example: 'Would you like to order an appetizer?',
    translation: 'món khai vị',
    category: 'food'
  },
  {
    id: '14',
    word: 'beverage',
    pronunciation: '/ˈbev.ɚ.ɪdʒ/',
    partOfSpeech: 'noun',
    definition: 'A drink, especially one other than water',
    example: 'What beverage would you like with your meal?',
    translation: 'đồ uống',
    category: 'food'
  },
  {
    id: '15',
    word: 'recipe',
    pronunciation: '/ˈres.ə.pi/',
    partOfSpeech: 'noun',
    definition: 'Instructions for preparing a dish',
    example: 'Can you share the recipe for this soup?',
    translation: 'công thức nấu ăn',
    category: 'food'
  },

  // Technology
  {
    id: '16',
    word: 'algorithm',
    pronunciation: '/ˈæl.ɡə.rɪ.ðəm/',
    partOfSpeech: 'noun',
    definition: 'A set of rules for solving a problem',
    example: 'The algorithm processes data very efficiently.',
    translation: 'thuật toán',
    category: 'technology'
  },
  {
    id: '17',
    word: 'bandwidth',
    pronunciation: '/ˈbænd.wɪdθ/',
    partOfSpeech: 'noun',
    definition: 'The amount of data that can be transmitted',
    example: 'We need more bandwidth for video calls.',
    translation: 'băng thông',
    category: 'technology'
  },
  {
    id: '18',
    word: 'interface',
    pronunciation: '/ˈɪn.t̬ɚ.feɪs/',
    partOfSpeech: 'noun',
    definition: 'A device or program enabling interaction',
    example: 'The user interface is very intuitive.',
    translation: 'giao diện',
    category: 'technology'
  },
  {
    id: '19',
    word: 'encrypt',
    pronunciation: '/ɪnˈkrɪpt/',
    partOfSpeech: 'verb',
    definition: 'To convert data into a code',
    example: 'We encrypt all sensitive information.',
    translation: 'mã hóa',
    category: 'technology'
  },
  {
    id: '20',
    word: 'optimize',
    pronunciation: '/ˈɑːp.tə.maɪz/',
    partOfSpeech: 'verb',
    definition: 'To make as effective as possible',
    example: 'We need to optimize the website for mobile devices.',
    translation: 'tối ưu hóa',
    category: 'technology'
  },

  // Education
  {
    id: '21',
    word: 'curriculum',
    pronunciation: '/kəˈrɪk.jə.ləm/',
    partOfSpeech: 'noun',
    definition: 'The subjects in a course of study',
    example: 'The curriculum includes math, science, and literature.',
    translation: 'chương trình giảng dạy',
    category: 'education'
  },
  {
    id: '22',
    word: 'scholarship',
    pronunciation: '/ˈskɑː.lɚ.ʃɪp/',
    partOfSpeech: 'noun',
    definition: 'Financial aid for a student',
    example: 'She received a scholarship to study abroad.',
    translation: 'học bổng',
    category: 'education'
  },
  {
    id: '23',
    word: 'comprehend',
    pronunciation: '/ˌkɑːm.prɪˈhend/',
    partOfSpeech: 'verb',
    definition: 'To understand something',
    example: 'It took me a while to comprehend the concept.',
    translation: 'hiểu, lĩnh hội',
    category: 'education'
  },
  {
    id: '24',
    word: 'assignment',
    pronunciation: '/əˈsaɪn.mənt/',
    partOfSpeech: 'noun',
    definition: 'A task given to students',
    example: 'The teacher gave us a difficult assignment.',
    translation: 'bài tập',
    category: 'education'
  },
  {
    id: '25',
    word: 'graduate',
    pronunciation: '/ˈɡrædʒ.u.eɪt/',
    partOfSpeech: 'verb',
    definition: 'To complete a course of study',
    example: 'I will graduate from university next year.',
    translation: 'tốt nghiệp',
    category: 'education'
  },

  // Health
  {
    id: '26',
    word: 'diagnosis',
    pronunciation: '/ˌdaɪ.əɡˈnoʊ.sɪs/',
    partOfSpeech: 'noun',
    definition: 'The identification of a disease',
    example: 'The doctor gave me a diagnosis.',
    translation: 'chẩn đoán',
    category: 'health'
  },
  {
    id: '27',
    word: 'symptom',
    pronunciation: '/ˈsɪmp.təm/',
    partOfSpeech: 'noun',
    definition: 'A sign of illness',
    example: 'Fever is a common symptom of flu.',
    translation: 'triệu chứng',
    category: 'health'
  },
  {
    id: '28',
    word: 'prescription',
    pronunciation: '/prɪˈskrɪp.ʃən/',
    partOfSpeech: 'noun',
    definition: 'A doctor\'s written order for medicine',
    example: 'You need a prescription for this medication.',
    translation: 'đơn thuốc',
    category: 'health'
  },
  {
    id: '29',
    word: 'immune',
    pronunciation: '/ɪˈmjuːn/',
    partOfSpeech: 'adjective',
    definition: 'Resistant to a disease',
    example: 'Vaccines help you become immune to diseases.',
    translation: 'miễn dịch',
    category: 'health'
  },
  {
    id: '30',
    word: 'recovery',
    pronunciation: '/rɪˈkʌv.ɚ.i/',
    partOfSpeech: 'noun',
    definition: 'The process of getting better',
    example: 'She made a full recovery after surgery.',
    translation: 'hồi phục',
    category: 'health'
  }
];

export function getWordsByCategory(categoryId: string): VocabularyWord[] {
  return vocabularyData.filter(word => word.category === categoryId);
}

export function getWordById(id: string): VocabularyWord | undefined {
  return vocabularyData.find(word => word.id === id);
}
