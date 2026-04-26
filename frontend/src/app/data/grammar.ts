export interface GrammarLesson {
  id: string;
  title: string;
  titleVi: string;
  level: "beginner" | "elementary" | "intermediate" | "upper-intermediate";
  category: string;
  icon: string;
  description: string;
  theory: string;
  structure: string;
  examples: Array<{ english: string; vietnamese: string }>;
  notes: string[];
  exercises: GrammarExercise[];
}

export interface GrammarExercise {
  id: string;
  type: "multiple-choice" | "fill-blank";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export const grammarLessons: GrammarLesson[] = [
  {
    id: "present-simple",
    title: "Present Simple",
    titleVi: "Thì Hiện Tại Đơn",
    level: "beginner",
    category: "Tenses",
    icon: "📅",
    description: "Diễn tả hành động thường xuyên, thói quen hoặc sự thật hiển nhiên",
    theory: `Thì hiện tại đơn (Present Simple) được dùng để:
• Diễn tả thói quen, hành động xảy ra thường xuyên
• Diễn tả sự thật hiển nhiên, quy luật tự nhiên
• Diễn tả lịch trình, thời gian biểu cố định`,
    structure: `(+) S + V(s/es) + O
(-) S + do/does + not + V + O  
(?) Do/Does + S + V + O?`,
    examples: [
      { english: "She goes to school every day.", vietnamese: "Cô ấy đến trường mỗi ngày." },
      { english: "The sun rises in the east.", vietnamese: "Mặt trời mọc ở phía đông." },
      { english: "He doesn't like coffee.", vietnamese: "Anh ấy không thích cà phê." },
      { english: "Do they speak English?", vietnamese: "Họ có nói tiếng Anh không?" },
    ],
    notes: [
      "Thêm -s/-es sau động từ khi chủ ngữ là he/she/it",
      "Các trạng từ thường gặp: always, usually, often, sometimes, rarely, never, every day/week/month",
      "Động từ đặc biệt: go→goes, do→does, have→has, watch→watches",
    ],
    exercises: [
      {
        id: "ps-1",
        type: "multiple-choice",
        question: "She ___ to work every morning.",
        options: ["go", "goes", "going", "gone"],
        answer: "goes",
        explanation: "Chủ ngữ 'She' là he/she/it nên thêm -s vào động từ: go → goes.",
      },
      {
        id: "ps-2",
        type: "fill-blank",
        question: "The train ___ (leave) at 8 AM every day.",
        answer: "leaves",
        explanation: "Dùng Present Simple cho lịch trình cố định. 'The train' = it nên thêm -s: leave → leaves.",
      },
      {
        id: "ps-3",
        type: "multiple-choice",
        question: "___ you speak French?",
        options: ["Do", "Does", "Are", "Is"],
        answer: "Do",
        explanation: "Câu hỏi với 'you' dùng 'Do', không dùng 'Does'.",
      },
      {
        id: "ps-4",
        type: "fill-blank",
        question: "He ___ (not/eat) meat.",
        answer: "does not eat",
        explanation: "Phủ định với he/she/it dùng 'does not + V nguyên thể'.",
      },
    ],
  },
  {
    id: "present-continuous",
    title: "Present Continuous",
    titleVi: "Thì Hiện Tại Tiếp Diễn",
    level: "beginner",
    category: "Tenses",
    icon: "🔄",
    description: "Diễn tả hành động đang xảy ra tại thời điểm nói",
    theory: `Thì hiện tại tiếp diễn (Present Continuous) được dùng để:
• Diễn tả hành động đang xảy ra ngay lúc nói
• Diễn tả hành động tạm thời đang diễn ra
• Diễn tả kế hoạch, dự định trong tương lai gần`,
    structure: `(+) S + am/is/are + V-ing + O
(-) S + am/is/are + not + V-ing + O
(?) Am/Is/Are + S + V-ing + O?`,
    examples: [
      { english: "I am studying English now.", vietnamese: "Tôi đang học tiếng Anh bây giờ." },
      { english: "They are playing football.", vietnamese: "Họ đang chơi bóng đá." },
      { english: "She isn't watching TV.", vietnamese: "Cô ấy không đang xem TV." },
      { english: "Are you coming tonight?", vietnamese: "Bạn có đến tối nay không?" },
    ],
    notes: [
      "Động từ kết thúc bằng -e thì bỏ -e rồi thêm -ing: write → writing",
      "Động từ kết thúc bằng phụ âm + nguyên âm + phụ âm: gấp đôi phụ âm cuối: run → running",
      "Các trạng từ thường gặp: now, at the moment, currently, right now, at present",
    ],
    exercises: [
      {
        id: "pc-1",
        type: "multiple-choice",
        question: "Look! She ___ a book.",
        options: ["reads", "is reading", "read", "has read"],
        answer: "is reading",
        explanation: "'Look!' cho thấy hành động đang xảy ra ngay lúc nói → Present Continuous.",
      },
      {
        id: "pc-2",
        type: "fill-blank",
        question: "They ___ (have) dinner right now.",
        answer: "are having",
        explanation: "'Right now' → hành động đang diễn ra → Present Continuous.",
      },
      {
        id: "pc-3",
        type: "multiple-choice",
        question: "We ___ to Paris next week. (plan)",
        options: ["fly", "are flying", "flew", "will fly"],
        answer: "are flying",
        explanation: "Present Continuous dùng cho kế hoạch đã định sẵn trong tương lai gần.",
      },
      {
        id: "pc-4",
        type: "fill-blank",
        question: "___ (you/listen) to music now?",
        answer: "Are you listening",
        explanation: "Câu hỏi Present Continuous: Am/Is/Are + S + V-ing?",
      },
    ],
  },
  {
    id: "past-simple",
    title: "Past Simple",
    titleVi: "Thì Quá Khứ Đơn",
    level: "beginner",
    category: "Tenses",
    icon: "⏮️",
    description: "Diễn tả hành động đã hoàn thành trong quá khứ",
    theory: `Thì quá khứ đơn (Past Simple) được dùng để:
• Diễn tả hành động đã xảy ra và kết thúc trong quá khứ
• Diễn tả chuỗi hành động liên tiếp trong quá khứ
• Diễn tả thói quen trong quá khứ (không còn nữa)`,
    structure: `(+) S + V-ed (regular) / V2 (irregular) + O
(-) S + did + not + V (nguyên thể) + O
(?) Did + S + V (nguyên thể) + O?`,
    examples: [
      { english: "I visited Hanoi last year.", vietnamese: "Tôi đã thăm Hà Nội năm ngoái." },
      { english: "She went to school yesterday.", vietnamese: "Cô ấy đã đi học hôm qua." },
      { english: "He didn't watch the movie.", vietnamese: "Anh ấy không xem bộ phim đó." },
      { english: "Did you enjoy the party?", vietnamese: "Bạn có thích bữa tiệc không?" },
    ],
    notes: [
      "Động từ có quy tắc thêm -ed: work→worked, play→played, study→studied",
      "Động từ bất quy tắc: go→went, have→had, see→saw, come→came, do→did",
      "Các trạng từ thường gặp: yesterday, last week/month/year, ago, in 2020",
    ],
    exercises: [
      {
        id: "past-1",
        type: "multiple-choice",
        question: "I ___ a film last night.",
        options: ["watch", "watched", "am watching", "watches"],
        answer: "watched",
        explanation: "'Last night' chỉ thời gian trong quá khứ → Past Simple: watch + ed.",
      },
      {
        id: "past-2",
        type: "fill-blank",
        question: "She ___ (go) to Paris two years ago.",
        answer: "went",
        explanation: "'Go' là động từ bất quy tắc: go → went.",
      },
      {
        id: "past-3",
        type: "multiple-choice",
        question: "___ you see that movie?",
        options: ["Did", "Do", "Does", "Was"],
        answer: "Did",
        explanation: "Câu hỏi Past Simple dùng 'Did + S + V nguyên thể'.",
      },
      {
        id: "past-4",
        type: "fill-blank",
        question: "He ___ (not/come) to the meeting yesterday.",
        answer: "did not come",
        explanation: "Phủ định Past Simple: did not + V nguyên thể.",
      },
    ],
  },
  {
    id: "present-perfect",
    title: "Present Perfect",
    titleVi: "Thì Hiện Tại Hoàn Thành",
    level: "elementary",
    category: "Tenses",
    icon: "✅",
    description: "Diễn tả hành động đã xảy ra có liên quan đến hiện tại",
    theory: `Thì hiện tại hoàn thành (Present Perfect) được dùng để:
• Diễn tả hành động đã xảy ra (không rõ thời gian cụ thể)
• Diễn tả kinh nghiệm trong cuộc sống
• Diễn tả hành động vừa mới xảy ra
• Diễn tả hành động bắt đầu trong quá khứ, tiếp diễn đến hiện tại`,
    structure: `(+) S + have/has + V3 (past participle) + O
(-) S + have/has + not + V3 + O
(?) Have/Has + S + V3 + O?`,
    examples: [
      { english: "I have visited London three times.", vietnamese: "Tôi đã thăm London ba lần." },
      { english: "She has just finished her homework.", vietnamese: "Cô ấy vừa mới hoàn thành bài tập." },
      { english: "Have you ever eaten sushi?", vietnamese: "Bạn đã từng ăn sushi chưa?" },
      { english: "He hasn't called me yet.", vietnamese: "Anh ấy vẫn chưa gọi cho tôi." },
    ],
    notes: [
      "Từ khóa thường gặp: already, yet, just, ever, never, for, since, recently",
      "Phân biệt: 'for + khoảng thời gian' (for 2 years), 'since + mốc thời gian' (since 2020)",
      "V3 của động từ bất quy tắc: go→gone, see→seen, eat→eaten, write→written",
    ],
    exercises: [
      {
        id: "pp-1",
        type: "multiple-choice",
        question: "I ___ never ___ to Japan.",
        options: ["have / been", "has / been", "have / went", "has / went"],
        answer: "have / been",
        explanation: "Chủ ngữ 'I' dùng 'have'. 'Been' là V3 của 'be/go' trong ngữ cảnh này.",
      },
      {
        id: "pp-2",
        type: "fill-blank",
        question: "She ___ (just/finish) her exam.",
        answer: "has just finished",
        explanation: "'She' dùng 'has'. 'Just' đứng giữa have/has và V3. finish → finished.",
      },
      {
        id: "pp-3",
        type: "multiple-choice",
        question: "They ___ here for five years.",
        options: ["live", "lived", "have lived", "are living"],
        answer: "have lived",
        explanation: "'For five years' kết hợp với Present Perfect để chỉ hành động từ quá khứ đến nay.",
      },
      {
        id: "pp-4",
        type: "fill-blank",
        question: "___ (you/ever/try) Vietnamese food?",
        answer: "Have you ever tried",
        explanation: "Câu hỏi về kinh nghiệm: Have/Has + S + ever + V3?",
      },
    ],
  },
  {
    id: "modal-verbs",
    title: "Modal Verbs",
    titleVi: "Động Từ Khuyết Thiếu",
    level: "elementary",
    category: "Grammar",
    icon: "🔧",
    description: "Can, Could, Should, Must, May, Might và cách sử dụng",
    theory: `Động từ khuyết thiếu (Modal Verbs) biểu đạt:
• CAN / COULD: khả năng, sự cho phép
• SHOULD / OUGHT TO: lời khuyên, nghĩa vụ nhẹ
• MUST / HAVE TO: bắt buộc, cần thiết
• MAY / MIGHT: khả năng, sự cho phép lịch sự
• WILL / WOULD: tương lai, lời đề nghị`,
    structure: `S + modal verb + V (nguyên thể không 'to')
Modal verbs không thêm -s/-es
Phủ định: S + modal + not + V`,
    examples: [
      { english: "She can speak three languages.", vietnamese: "Cô ấy có thể nói ba ngôn ngữ." },
      { english: "You should study harder.", vietnamese: "Bạn nên học chăm hơn." },
      { english: "You must wear a seatbelt.", vietnamese: "Bạn phải thắt dây an toàn." },
      { english: "It might rain tomorrow.", vietnamese: "Ngày mai có thể trời mưa." },
    ],
    notes: [
      "Modal verbs không chia theo ngôi: he can (NOT he cans)",
      "Sau modal verbs luôn dùng V nguyên thể: can go (NOT can to go)",
      "MUST = bắt buộc từ bên trong; HAVE TO = bắt buộc từ bên ngoài (quy định)",
    ],
    exercises: [
      {
        id: "mv-1",
        type: "multiple-choice",
        question: "You ___ smoke here. It's not allowed.",
        options: ["mustn't", "don't have to", "shouldn't", "might not"],
        answer: "mustn't",
        explanation: "'Mustn't' = cấm đoán tuyệt đối. 'Don't have to' = không cần thiết (nhưng không cấm).",
      },
      {
        id: "mv-2",
        type: "fill-blank",
        question: "She ___ (can) speak French when she was five.",
        answer: "could",
        explanation: "Quá khứ của 'can' là 'could'.",
      },
      {
        id: "mv-3",
        type: "multiple-choice",
        question: "___ I open the window? (xin phép)",
        options: ["Should", "Must", "May", "Will"],
        answer: "May",
        explanation: "'May I...?' dùng để xin phép lịch sự.",
      },
      {
        id: "mv-4",
        type: "fill-blank",
        question: "You look tired. You ___ (should) get some rest.",
        answer: "should",
        explanation: "'Should' dùng để đưa ra lời khuyên.",
      },
    ],
  },
  {
    id: "conditionals",
    title: "Conditional Sentences",
    titleVi: "Câu Điều Kiện",
    level: "intermediate",
    category: "Grammar",
    icon: "🔀",
    description: "Ba loại câu điều kiện cơ bản và cách sử dụng",
    theory: `Câu điều kiện (Conditional Sentences) có 3 loại chính:
• Type 0: Sự thật hiển nhiên, điều luôn đúng
• Type 1: Điều kiện có thể xảy ra ở hiện tại/tương lai
• Type 2: Điều kiện không có thực ở hiện tại, giả định
• Type 3: Điều kiện không có thực trong quá khứ`,
    structure: `Type 0: If + S + V(present), S + V(present)
Type 1: If + S + V(present), S + will + V
Type 2: If + S + V(past), S + would + V
Type 3: If + S + had + V3, S + would have + V3`,
    examples: [
      { english: "If you heat water to 100°C, it boils. (Type 0)", vietnamese: "Nếu bạn đun nước đến 100°C, nó sẽ sôi." },
      { english: "If it rains, I will stay home. (Type 1)", vietnamese: "Nếu trời mưa, tôi sẽ ở nhà." },
      { english: "If I were rich, I would travel the world. (Type 2)", vietnamese: "Nếu tôi giàu, tôi sẽ đi du lịch khắp nơi." },
      { english: "If she had studied, she would have passed. (Type 3)", vietnamese: "Nếu cô ấy đã học, cô ấy đã đỗ rồi." },
    ],
    notes: [
      "Type 2 luôn dùng 'were' thay cho 'was': If I were you... (KHÔNG dùng If I was)",
      "Mệnh đề If và mệnh đề chính có thể đổi vị trí",
      "Mixed Conditional: kết hợp điều kiện quá khứ với kết quả hiện tại",
    ],
    exercises: [
      {
        id: "cond-1",
        type: "multiple-choice",
        question: "If I ___ rich, I would buy a house.",
        options: ["am", "was", "were", "had been"],
        answer: "were",
        explanation: "Type 2 điều kiện không có thực ở hiện tại. 'Were' dùng cho tất cả các ngôi.",
      },
      {
        id: "cond-2",
        type: "fill-blank",
        question: "If it ___ (rain) tomorrow, we will cancel the trip.",
        answer: "rains",
        explanation: "Type 1: If + V (present), S + will + V. Dùng V hiện tại trong mệnh đề If.",
      },
      {
        id: "cond-3",
        type: "multiple-choice",
        question: "If she had called me, I ___ helped her.",
        options: ["would", "will", "would have", "had"],
        answer: "would have",
        explanation: "Type 3: Mệnh đề chính dùng 'would have + V3'.",
      },
      {
        id: "cond-4",
        type: "fill-blank",
        question: "If you ___ (study) harder, you will pass the exam.",
        answer: "study",
        explanation: "Type 1: Mệnh đề If dùng Present Simple.",
      },
    ],
  },
  {
    id: "passive-voice",
    title: "Passive Voice",
    titleVi: "Câu Bị Động",
    level: "intermediate",
    category: "Grammar",
    icon: "🔃",
    description: "Chuyển đổi câu chủ động sang bị động",
    theory: `Câu bị động (Passive Voice) được dùng khi:
• Không biết ai thực hiện hành động
• Chủ thể của hành động không quan trọng
• Muốn nhấn mạnh vào đối tượng chịu tác động`,
    structure: `Active:  S + V + O
Passive: O + be + V3 + (by S)

Theo thì:
• Present Simple: am/is/are + V3
• Past Simple: was/were + V3
• Present Perfect: have/has been + V3
• Future: will be + V3`,
    examples: [
      { english: "English is spoken worldwide. (Active: People speak English worldwide.)", vietnamese: "Tiếng Anh được nói trên toàn thế giới." },
      { english: "The book was written by Tolkien.", vietnamese: "Cuốn sách được viết bởi Tolkien." },
      { english: "The letter has been sent.", vietnamese: "Bức thư đã được gửi." },
      { english: "The project will be completed by Friday.", vietnamese: "Dự án sẽ được hoàn thành vào thứ Sáu." },
    ],
    notes: [
      "Chỉ dùng câu bị động với ngoại động từ (transitive verbs - động từ có tân ngữ)",
      "'By + agent' có thể bỏ qua nếu không cần thiết",
      "Thì của 'be' xác định thì của câu bị động",
    ],
    exercises: [
      {
        id: "pv-1",
        type: "multiple-choice",
        question: "The cake ___ by my mother every Sunday.",
        options: ["make", "made", "is made", "makes"],
        answer: "is made",
        explanation: "Present Simple Passive: am/is/are + V3. 'The cake' = it → 'is made'.",
      },
      {
        id: "pv-2",
        type: "fill-blank",
        question: "The letter ___ (send) yesterday.",
        answer: "was sent",
        explanation: "Past Simple Passive: was/were + V3. 'The letter' → 'was sent'.",
      },
      {
        id: "pv-3",
        type: "multiple-choice",
        question: "The new bridge ___ built next year.",
        options: ["is", "was", "will be", "has been"],
        answer: "will be",
        explanation: "Future Passive: will be + V3.",
      },
      {
        id: "pv-4",
        type: "fill-blank",
        question: "This song ___ (write) by Taylor Swift.",
        answer: "was written",
        explanation: "Past Simple Passive: was/were + V3. 'write' → 'written'.",
      },
    ],
  },
  {
    id: "articles",
    title: "Articles",
    titleVi: "Mạo Từ",
    level: "beginner",
    category: "Grammar",
    icon: "📝",
    description: "Cách dùng mạo từ a, an, the đúng cách",
    theory: `Mạo từ (Articles) gồm:
• A / AN (mạo từ không xác định): dùng trước danh từ số ít, chưa xác định
  - A: trước phụ âm (a book, a university)
  - AN: trước nguyên âm (an apple, an hour)
• THE (mạo từ xác định): dùng khi cả người nói lẫn người nghe đều biết đến vật đó
• Zero Article (không mạo từ): danh từ số nhiều chung chung, tên riêng`,
    structure: `A/AN + danh từ số ít (lần đầu đề cập)
THE + danh từ đã biết/xác định
Ø + danh từ số nhiều/không đếm được (nghĩa chung)`,
    examples: [
      { english: "I saw a cat. The cat was black.", vietnamese: "Tôi thấy một con mèo. Con mèo đó màu đen." },
      { english: "She is an engineer.", vietnamese: "Cô ấy là một kỹ sư." },
      { english: "The moon is beautiful tonight.", vietnamese: "Mặt trăng đêm nay rất đẹp." },
      { english: "I love music. (Ø music)", vietnamese: "Tôi thích âm nhạc." },
    ],
    notes: [
      "'A university' (không phải 'an university') vì 'u' trong 'university' phát âm là /j/ (phụ âm)",
      "'An hour' (không phải 'a hour') vì 'h' trong 'hour' không được phát âm",
      "Không dùng 'the' trước tên nước, tên người, bữa ăn (breakfast, lunch), môn học",
    ],
    exercises: [
      {
        id: "art-1",
        type: "multiple-choice",
        question: "She wants to be ___ doctor.",
        options: ["a", "an", "the", "Ø"],
        answer: "a",
        explanation: "'Doctor' bắt đầu bằng phụ âm /d/ → dùng 'a'.",
      },
      {
        id: "art-2",
        type: "fill-blank",
        question: "I saw ___ elephant at the zoo. ___ elephant was very big.",
        answer: "an / The",
        explanation: "'Elephant' bắt đầu bằng nguyên âm → 'an'. Lần thứ hai đã biết → 'The'.",
      },
      {
        id: "art-3",
        type: "multiple-choice",
        question: "___ sun rises in the east.",
        options: ["A", "An", "The", "Ø"],
        answer: "The",
        explanation: "Dùng 'The' trước các vật thể duy nhất trong vũ trụ: the sun, the moon, the earth.",
      },
      {
        id: "art-4",
        type: "fill-blank",
        question: "He is ___ honest man.",
        answer: "an",
        explanation: "'Honest' bắt đầu bằng nguyên âm /ɒ/ (h câm) → dùng 'an'.",
      },
    ],
  },
];

export function getLessonById(id: string): GrammarLesson | undefined {
  return grammarLessons.find(l => l.id === id);
}

export function getLessonsByLevel(level: string): GrammarLesson[] {
  return grammarLessons.filter(l => l.level === level);
}

export const grammarLevels = [
  { id: "beginner", name: "Beginner", nameVi: "Cơ bản", color: "green", icon: "🌱" },
  { id: "elementary", name: "Elementary", nameVi: "Sơ cấp", color: "blue", icon: "📘" },
  { id: "intermediate", name: "Intermediate", nameVi: "Trung cấp", color: "purple", icon: "🎓" },
  { id: "upper-intermediate", name: "Upper-Intermediate", nameVi: "Trung-cao cấp", color: "orange", icon: "🏆" },
];
