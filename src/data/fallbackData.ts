import {
  User,
  Category,
  Work,
  Topic,
  ModerationFlag,
  PlatformSettings,
} from '../types/schema';

export const INITIAL_SETTINGS: PlatformSettings = {
  amazon_associate_tag: 'veritaslitterae-20',
  default_affiliate_disclaimer:
    'Comprando por este link, você apoia a curadoria e manutenção editorial deste projeto sem custo adicional.',
  require_moderation_for_new_works: true,
  editorial_edition_label: 'Edição de Outono • Vol. IV — MMXXVI',
};

export const DEMO_USERS: Record<string, User> = {
  ADMIN: {
    id: 1,
    name: 'Prof. Augusto Vasconcelos',
    username: 'augusto.vasconcelos',
    email: 'augusto@veritaslitterae.org',
    role: 'ADMIN',
    title_badge: 'Editor-Chefe & Curador Patrístico',
    bio: 'Doutor em Letras Clássicas e pesquisador da tradição agostiniana e do Trivium.',
    is_banned: false,
    reputation_score: 1420,
    created_at: '2025-01-10T10:00:00Z',
  },
  MODERATOR: {
    id: 2,
    name: 'Helena Monteiro de Barros',
    username: 'helena.barros',
    email: 'helena@veritaslitterae.org',
    role: 'MODERATOR',
    title_badge: 'Moderadora • Educação Clássica',
    bio: 'Preceptora de Artes Liberais, tradutora de latim e estudiosa de Charlotte Mason e Dorothy Sayers.',
    is_banned: false,
    reputation_score: 980,
    created_at: '2025-02-14T14:30:00Z',
  },
  MEMBER: {
    id: 3,
    name: 'Lucas Albuquerque',
    username: 'lucas.albuquerque',
    email: 'lucas@leitor.org',
    role: 'MEMBER',
    title_badge: 'Membro Confrade • Crítica Literária',
    bio: 'Ensaísta e entusiasta da literatura russa, dos Inklings e do cinema contemplativo.',
    is_banned: false,
    reputation_score: 430,
    created_at: '2025-05-01T09:15:00Z',
  },
  MOD_EDITORIAL: {
    id: 5,
    name: 'Moderador Editorial',
    username: 'moderador.veritas',
    email: 'mod@veritas.com',
    role: 'MODERATOR',
    title_badge: 'Conselho de Moderação • Revisão Editorial',
    bio: 'Responsável pela revisão e aprovação das resenhas e ensaios submetidos pelos membros.',
    is_banned: false,
    reputation_score: 1100,
    created_at: '2026-11-10T15:23:31Z',
  },
  ADMIN_GERAL: {
    id: 6,
    name: 'Administrador Geral',
    username: 'admin.veritas',
    email: 'admin@veritas.com',
    role: 'ADMIN',
    title_badge: 'Administrador & Editor-Chefe',
    bio: 'Gestão de papéis RBAC, curadoria e configurações globais.',
    is_banned: false,
    reputation_score: 1500,
    created_at: '2026-11-10T15:23:31Z',
  },
  VISITOR: {
    id: 0,
    name: 'Leitor Visitante',
    username: 'visitante',
    email: '',
    role: 'VISITOR',
    title_badge: 'Visitante do Átrio',
    bio: 'Navegando pelo acervo público e diálogos comunitários.',
    is_banned: false,
    reputation_score: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Letras & Teologia',
    slug: 'letras-teologia',
    latin_motto: 'Fides quaerens intellectum',
    description:
      'Patrística, teologia histórica, clássicos da literatura universal, devocionais seculares e ficção mitopoética.',
    accent_color: 'burgundy',
    icon_name: 'BookOpen',
    works_count: 14,
    topics_count: 28,
  },
  {
    id: 2,
    name: 'Educação & Mente',
    slug: 'educacao-mente',
    latin_motto: 'Artes Liberales & Paideia',
    description:
      'Educação clássica cristã, Trivium e Quadrivium, formação do imaginário moral, pedagogia de Charlotte Mason e homeschooling.',
    accent_color: 'forest',
    icon_name: 'GraduationCap',
    works_count: 9,
    topics_count: 19,
  },
  {
    id: 3,
    name: 'Sétima Arte & Música',
    slug: 'setima-arte-musica',
    latin_motto: 'Pulchritudo & Contemplatio',
    description:
      'Cinema de alta densidade espiritual, documentários históricos, polifonia sacra, artes plásticas e estética do belo.',
    accent_color: 'navy',
    icon_name: 'Film',
    works_count: 8,
    topics_count: 15,
  },
  {
    id: 4,
    name: 'Diálogos Abertos',
    slug: 'dialogos-abertos',
    latin_motto: 'In necessariis unitas, in dubiis libertas',
    description:
      'Colóquios interdisciplinares, filosofia pública, cultura contemporânea, vocação intelectual e ética cristã.',
    accent_color: 'gold',
    icon_name: 'MessageSquareQuote',
    works_count: 5,
    topics_count: 34,
  },
];

export const INITIAL_WORKS: Work[] = [
  {
    id: 1,
    title: 'Confissões',
    subtitle: 'A Anatomia da Alma, a Memória e o Repouso em Deus no Pensamento de Santo Agostinho',
    slug: 'confissoes-santo-agostinho',
    creator: 'Santo Agostinho de Hipona',
    media_type: 'BOOK',
    release_year: 398,
    category_id: 1,
    category: INITIAL_CATEGORIES[0],
    cover_url:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
    synopsis: `Escritas entre 397 e 400 d.C., quando Agostinho já ocupava a cátedra episcopal de Hipona, as *Confissões* não inauguram apenas o gênero da autobiografia espiritual no Ocidente: elas fundam uma nova psicologia da memória, do tempo e do desejo humano diante da transcendência divina. O termo latino *confessio* possui aqui um duplo sentido inseparável: é simultaneamente o reconhecimento humilde das próprias misérias e o louvor extasiado à misericórdia do Criador.

> Fizeste-nos para Ti, Senhor, e inquieto está o nosso coração enquanto não repousa em Ti.

## I. Da Retórica da Vaidade à Sede da Verdade

Nos primeiros seis livros, acompanhamos a formação intelectual do jovem nascido em Tagaste. Agostinho não esconde a ambição que o movia nas escolas de Cartago e Roma: o ensino das letras era visto não como busca da sabedoria, mas como moeda de prestígio social e vitória nos tribunais. Contudo, a leitura do *Hortênsio* — diálogo hoje perdido de Cícero — acende nele uma chama que nenhuma honraria mundana pôde apagar: o amor à filosofia (*amor sapientiae*).

Ainda assim, sua jornada passa pelo longo desvio do maniqueísmo e pelo ceticismo acadêmico, até que o encontro com a pregação de **Santo Ambrósio, em Milão**, desfaz seus preconceitos contra as Escrituras e lhe revela a leitura espiritual do Antigo Testamento e a metafísica da imaterialidade divina.

* * *

## II. O Jardim de Milão e a Cura da Vontade Dividida

O clímax dramático do Livro VIII — a célebre cena do jardim em que uma voz infantil entoa *"Tolle, lege! Tolle, lege!"* (Toma e lê!) — é precedido por uma das análises mais penetrantes já escritas sobre a paralisia da vontade humana. Agostinho já estava intelectualmente convencido da verdade cristã, mas permanecia preso pelos grilhões do hábito. Ele descobre que a razão sozinha não redime o homem: é preciso que a Graça divina encante e reordene o próprio peso do coração (*pondus meum amor meus*).

> Tarde Vos amei, ó Beleza tão antiga e tão nova, tarde Vos amei! Eis que habitáveis dentro de mim, e eu lá fora a procurar-Vos! E eu, disforme, lançava-me sobre as belas formas das criaturas que fizestes.

## III. Memória, Tempo e Eternidade (Livros X a XIII)

Muitos leitores interrompem a obra após a morte de Santa Mônica, no Livro IX, perdendo aquilo que constitui a cúpula filosófica das *Confissões*. Nos livros finais, Agostinho investiga os "vastos palácios da memória" (Livro X), formula sua extraordinária teoria do tempo como *distentio animi* — distensão da alma entre a lembrança, a atenção presente e a espera (Livro XI) — e encerra com uma leitura alegórica e trinitária do relato da Criação no Gênesis.

Para o leitor contemporâneo, imerso na fragmentação e na pressa, ler as *Confissões* com um lápis em punho é redescobrir a unidade interior da alma.`,
    notable_quotes: [
      {
        id: 1,
        quote_text:
          'Fizeste-nos para Ti, Senhor, e o nosso coração permanece inquieto enquanto não descansa em Ti.',
        source_note: 'Livro I, Capítulo 1',
      },
      {
        id: 2,
        quote_text:
          'Tarde Vos amei, ó Beleza tão antiga e tão nova, tarde Vos amei! Eis que habitáveis dentro de mim, e eu lá fora a procurar-Vos!',
        source_note: 'Livro X, Capítulo 27',
      },
    ],
    affiliate_url:
      'https://www.amazon.com.br/s?k=Confissoes+Santo+Agostinho+Capa+Dura',
    affiliate_cta_label: 'Adquirir na Amazon',
    affiliate_price_hint: 'Edição de Luxo Capa Dura • R$ 69,90',
    affiliate_clicks_count: 184,
    isbn_or_ref: 'ISBN 978-85-326-5412-0',
    publisher_or_studio: 'Penguin-Companhia / Ecclesiae',
    is_featured: true,
    editorial_rating: 5.0,
    reviews_count: 18,
    status: 'APPROVED',
    submitted_by_id: 1,
    submitted_by: DEMO_USERS.ADMIN,
    created_at: '2026-10-05T11:00:00Z',
    comments: [
      {
        id: 101,
        body: `O Livro XI das *Confissões*, dedicado à natureza do tempo e da eternidade, permanece insuperável mesmo após Heidegger e Bergson.

> Se ninguém me pergunta o que é o tempo, eu sei; se quero explicá-lo a quem me pergunta, já não sei.

Para os confrades que estão iniciando a leitura em grupo: recomendo ler os livros I a IX em paralelo com o diálogo *De Magistro*. A transição da retórica mundana para a Palavra encarnada fica cristalina.`,
        rating: 5,
        work_id: 1,
        parent_id: null,
        author_id: 2,
        author: DEMO_USERS.MODERATOR,
        upvotes_count: 29,
        status: 'APPROVED',
        created_at: '2026-10-12T15:20:00Z',
        replies: [
          {
            id: 102,
            body: `Excelente aponte, Professora Helena! Acrescento que a tradução de J. Oliveira Santos e A. Ambrósio de Pina preserva uma cadência clássica raríssima em língua portuguesa. O capítulo sobre a morte de Santa Mônica em Óstia Tiberina é de fazer chorar em silêncio.`,
            rating: null,
            work_id: 1,
            parent_id: 101,
            author_id: 3,
            author: DEMO_USERS.MEMBER,
            upvotes_count: 14,
            status: 'APPROVED',
            created_at: '2026-10-12T18:05:00Z',
            replies: [],
          },
        ],
      },
      {
        id: 105,
        body: `Reli este mês o Livro VIII e sempre me impressiona como Agostinho descreve a "doença da vontade": a mente ordena ao corpo que a mão se mova, e ela se move imediatamente; mas quando a mente ordena a si mesma que queira inteiramente o Bem, ela vacila porque ama duas coisas opostas.`,
        rating: 5,
        work_id: 1,
        parent_id: null,
        author_id: 3,
        author: DEMO_USERS.MEMBER,
        upvotes_count: 19,
        status: 'APPROVED',
        created_at: '2026-10-16T20:40:00Z',
        replies: [],
      },
    ],
  },
  {
    id: 2,
    title: 'A Abolição do Homem',
    subtitle: 'A Educação das Afeições Ordenadas, a Lei Natural (Tao) e o Perigo dos "Homens sem Peito"',
    slug: 'a-abolicao-do-homem-cs-lewis',
    creator: 'C. S. Lewis',
    media_type: 'BOOK',
    release_year: 1943,
    category_id: 2,
    category: INITIAL_CATEGORIES[1],
    cover_url:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85',
    synopsis: `Originalmente proferido como as *Riddell Memorial Lectures* na Universidade de Durham em 1943, *A Abolição do Homem* é considerado pelo próprio C. S. Lewis e por seus biógrafos o seu mais importante ensaio filosófico e pedagógico. Partindo da análise de um modesto livro didático de língua inglesa ("O Livro Verde"), Lewis diagnostica como o subjetivismo moral moderno corrói silenciosamente a própria possibilidade da virtude humana.

> Fazemos homens sem peito e esperamos deles virtude e empreendimento; rimos da honra e nos chocamos ao encontrar traidores entre nós; castramos e exigimos que os castrados sejam fecundos.

## I. A Parábola da Cachoeira de Coleridge

No primeiro capítulo, intitulado *"Homens sem Peito"*, Lewis recorda o famoso episódio em que o poeta Samuel Taylor Coleridge observava uma cachoeira ao lado de dois turistas. Um deles a chamou de "sublime", enquanto o outro a definiu como "bonita". Coleridge aprovou o primeiro juízo e rejeitou o segundo com veemência.

Os autores do livro escolar moderno, porém, ensinavam às crianças que dizer "a cachoeira é sublime" não afirma absolutamente nada sobre a cachoeira em si, mas apenas sobre "os sentimentos subjetivos de quem fala". Lewis mostra o efeito devastador dessa pequena lição: o aluno aprende, sem perceber, que nenhuma realidade no universo merece objetivamente reverência, admiração, gratidão ou temor.

* * *

## II. O Coração como Mediador entre o Intelecto e o Ventre

Recuperando a antropologia tripartida de Platão, Aristóteles e Santo Agostinho, Lewis recorda que a cabeça (o intelecto calculista) não pode governar diretamente o ventre (os apetites instintivos). Ela precisa de um mediador: o **Peito** (*Thymos* ou Coração) — a sede das afeições justas, da magnanimidade e dos sentimentos treinados pelo hábito da beleza.

> Santo Agostinho define a virtude como ordo amoris, a condição ordenada das afeições na qual cada objeto recebe o grau de amor que lhe é apropriado. Aristóteles diz que a finalidade da educação é fazer com que o aluno goste e desgoste daquilo que é certo.

Quando uma cultura ridiculariza a nobreza, a piedade filial e o sacrifício como meras "projeções emocionais", ela produz intelectuais frios e apetites desgovernados: **homens sem peito**.

## III. A Conquista Final da Natureza

No terceiro capítulo, Lewis projeta as consequências últimas de uma sociedade tecnocrática que rejeita o *Tao* (a Lei Natural e os primeiros princípios da razão prática). Quando o último elo com a verdade moral objetiva é rompido, a "conquista da Natureza pelo Homem" revela sua face real: o poder absoluto de alguns poucos "Condicionadores" sobre toda a humanidade futura — reduzida a mera matéria-prima biológica e psicológica.`,
    notable_quotes: [
      {
        id: 3,
        quote_text:
          'A tarefa do educador moderno não é derrubar florestas, mas irrigar desertos. A defesa correta contra os sentimentos falsos é inculcar sentimentos justos.',
        source_note: 'Capítulo 1 — Homens sem Peito',
      },
      {
        id: 4,
        quote_text:
          'Se os governantes da sociedade não tiverem dentro de si o Tao, não serão mais do que condicionadores de homens — e a conquista final da natureza será a abolição do próprio homem.',
        source_note: 'Capítulo 3 — A Abolição do Homem',
      },
    ],
    affiliate_url:
      'https://www.amazon.com.br/s?k=A+Abolicao+do+Homem+CS+Lewis',
    affiliate_cta_label: 'Adquirir na Amazon',
    affiliate_price_hint: 'Edição Thomas Nelson / Capa Dura • R$ 42,90',
    affiliate_clicks_count: 231,
    isbn_or_ref: 'ISBN 978-85-7860-985-6',
    publisher_or_studio: 'Thomas Nelson Brasil',
    is_featured: true,
    editorial_rating: 4.9,
    reviews_count: 24,
    status: 'APPROVED',
    submitted_by_id: 2,
    submitted_by: DEMO_USERS.MODERATOR,
    created_at: '2026-10-08T09:30:00Z',
    comments: [
      {
        id: 103,
        body: `Todo educador cristão deveria reler "Homens sem Peito" ao início de cada ano letivo. A distinção que Lewis traça entre debochar das emoções e ordenar os afetos segundo a verdade objetiva é a chave da formação imaginativa. Sem um imaginário nutrido por heróis, poesia e sacrifício antes da idade crítica, a lógica se torna estéril.`,
        rating: 5,
        work_id: 2,
        parent_id: null,
        author_id: 1,
        author: DEMO_USERS.ADMIN,
        upvotes_count: 35,
        status: 'APPROVED',
        created_at: '2026-10-14T10:15:00Z',
        replies: [],
      },
    ],
  },
  {
    id: 3,
    title: 'A Árvore da Vida (The Tree of Life)',
    subtitle: 'Poema Cinematográfico sobre Graça, Natureza, Memória Familiar e a Resposta de Deus a Jó',
    slug: 'a-arvore-da-vida-terrence-malick',
    creator: 'Terrence Malick (Direção) • Emmanuel Lubezki (Fotografia)',
    media_type: 'FILM',
    release_year: 2011,
    category_id: 3,
    category: INITIAL_CATEGORIES[2],
    cover_url:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85',
    synopsis: `Palma de Ouro no Festival de Cannes, *A Árvore da Vida* abre com a pergunta epigráfica do Livro de Jó (38:4,7): *"Onde estavas tu quando eu lançava os fundamentos da terra... quando as estrelas da alva juntas alegremente cantavam?"*.

Estruturado como uma catedral audiovisual — acompanhada pelo *Lacrimosa* de Preisner, Bach, Couperin e Brahms —, o filme de Terrence Malick contrapõe dois caminhos na existência de uma família texana dos anos 1950: o caminho da **Natureza** (que quer ser servida e dominar) e o caminho da **Graça** (que aceita o sofrimento, perdoa e ama desinteressadamente).

> As freiras nos ensinaram que há dois caminhos através da vida: o caminho da Natureza e o caminho da Graça. Você deve escolher qual deles seguirá.

## I. A Teodiceia através da Beleza e da Memória

Quando a família O'Brien recebe o telegrama comunicando a morte precoce de um dos filhos, a dor da mãe não encontra alívio em discursos racionais ou consolações fáceis. Malick responde ao grito de luto da mãe exactamente como o próprio Deus responde a Jó no capítulo 38: desdobrando na tela uma sequência monumental de vinte minutos sobre a criação do cosmos, o nascimento das galáxias e a aurora da vida.

Longe de ser um desvio cientificista, essa sequência afirma que o sofrimento de uma única criança no interior do Texas está misteriosamente inscrito na mesma história cósmica presidida pelo Amor criador.

* * *

## II. A Infância Vista sob a Luz da Graça

A câmera de Emmanuel Lubezki — utilizando exclusivamente luz natural — move-se pelos quartos, jardins e árvores da infância não como um observador neutro, mas quase como um olhar angélico ou como a própria memória transfigurada pela oração. Cada sussurro dos personagens ("Senhor, por que não nos deixas ver-Te? No entanto, não há nada onde Tu não estejas") sobe como um salmo silencioso.`,
    notable_quotes: [
      {
        id: 5,
        quote_text:
          'As freiras nos ensinaram que há dois caminhos através da vida: o caminho da Natureza e o caminho da Graça. Você deve escolher qual deles seguirá.',
        source_note: 'Monólogo de Abertura — Sra. O’Brien',
      },
      {
        id: 6,
        quote_text:
          'Senhor, por que não nos deixas ver-Te? No entanto, não há nada onde Tu não estejas.',
        source_note: 'Prece de Jack O’Brien',
      },
    ],
    affiliate_url:
      'https://www.amazon.com.br/s?k=The+Tree+of+Life+Terrence+Malick+Blu-ray',
    affiliate_cta_label: 'Onde Encontrar (Edição Criterion / Mídia)',
    affiliate_price_hint: 'Blu-Ray Criterion Collection / Aluguel Digital',
    affiliate_clicks_count: 112,
    isbn_or_ref: 'Criterion Spine #938 • 139 min',
    publisher_or_studio: 'Fox Searchlight / Criterion Collection',
    is_featured: true,
    editorial_rating: 4.9,
    reviews_count: 15,
    status: 'APPROVED',
    submitted_by_id: 3,
    submitted_by: DEMO_USERS.MEMBER,
    created_at: '2026-10-11T16:40:00Z',
    comments: [],
  },
  {
    id: 4,
    title: 'Ortodoxia',
    subtitle: 'A Aventura Intelectual da Fé Cristã, a Ética da Terra dos Elfos e a Democracia dos Mortos',
    slug: 'ortodoxia-gk-chesterton',
    creator: 'G. K. Chesterton',
    media_type: 'BOOK',
    release_year: 1908,
    category_id: 1,
    category: INITIAL_CATEGORIES[0],
    cover_url:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=85',
    synopsis: `Publicado em 1908 em resposta aos críticos que exigiam de G. K. Chesterton uma exposição positiva de sua própria filosofia após os combates de *Hereges*, *Ortodoxia* permanece como uma das mais luminosas apologéticas literárias já escritas em língua inglesa. Com seu inconfundível domínio do paradoxo e do humor inglês, Chesterton narra como tentou descobrir uma terra incógnita e fundar uma nova filosofia por conta própria, apenas para perceber, ao desembarcar na praia, que estava plantando sua bandeira em solo britânico: sua "descoberta" já existia há dois mil anos no Credo dos Apóstolos.

> O louco não é o homem que perdeu a razão. O louco é o homem que perdeu tudo, exceto a razão.

## I. A Loucura do Racionalismo Fechado e a Liberdade da Mística

No segundo capítulo (*"O Maníaco"*), Chesterton desmonta a ilusão moderna de que o materialismo determinista seria sinônimo de lucidez mental. Ao contrário: é justamente o paranoico no manicômio quem possui uma explicação perfeitamente lógica, hermética e irrefutável para cada detalhe do mundo. O cristão, por sua vez, habita um universo aberto ao mistério, à liberdade e à graça.

* * *

## II. A Ética da Terra dos Elfos e a Tradição

Talvez o capítulo mais belo de todo o livro seja o quarto (*"A Ética da Terra dos Elfos"*), onde Chesterton afirma que aprendeu mais sobre a verdadeira filosofia nos contos de fadas do berçário do que em todos os tratados positivistas do século XIX. Nos contos de fadas, o mundo é governado por uma "condicionalidade mágica" (*"Você pode viver no palácio de cristal, desde que não colha esta única flor"*), que prefigura a gratidão e a humildade diante da Criação.

E é também ali que surge sua célebre definição de Tradição como **a democracia dos mortos**: a recusa em submeter-se à arrogante oligarquia das pessoas que apenas por acaso estão caminhando sobre a terra hoje.`,
    notable_quotes: [
      {
        id: 7,
        quote_text:
          'A tradição significa dar votos à mais obscura de todas as classes, aos nossos antepassados. É a democracia dos mortos.',
        source_note: 'Capítulo IV — A Ética da Terra dos Elfos',
      },
    ],
    affiliate_url: 'https://www.amazon.com.br/s?k=Ortodoxia+Chesterton+Mundo+Cristao',
    affiliate_cta_label: 'Adquirir na Amazon',
    affiliate_price_hint: 'Edição Bolso de Luxo / Capa Dura • R$ 39,90',
    affiliate_clicks_count: 164,
    isbn_or_ref: 'ISBN 978-85-7325-534-8',
    publisher_or_studio: 'Mundo Cristão / Ecclesiae',
    is_featured: false,
    editorial_rating: 4.9,
    reviews_count: 19,
    status: 'APPROVED',
    submitted_by_id: 1,
    submitted_by: DEMO_USERS.ADMIN,
    created_at: '2026-10-15T12:00:00Z',
    comments: [],
  },
  {
    id: 5,
    title: 'As Ferramentas Perdidas da Aprendizagem',
    subtitle: 'O Resgate do Trivium Medieval para a Renovação do Ensino Clássico',
    slug: 'as-ferramentas-perdidas-da-aprendizagem-dorothy-sayers',
    creator: 'Dorothy L. Sayers',
    media_type: 'ESSAY',
    release_year: 1947,
    category_id: 2,
    category: INITIAL_CATEGORIES[1],
    cover_url:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=85',
    synopsis: `Conferência histórica proferida na Universidade de Oxford em 1947 pela romancista, classicista e célebre tradutora da *Divina Comédia* de Dante, Dorothy L. Sayers. Nela, Sayers argumenta que a escola moderna ensina dezenas de "matérias" isoladas, mas fracassa em entregar ao estudante os instrumentos do próprio pensamento.

> Não é a grande falha da nossa educação hoje que, embora muitas vezes sejamos bem-sucedidos em ensinar matérias aos nossos alunos, falhamos lamentavelmente em ensiná-los a pensar? Eles aprendem tudo, exceto a arte de aprender.

## As Três Idades da Mente e o Trivium

A grande intuição pedagógica de Sayers consiste em alinhar as três disciplinas do **Trivium** medieval com três estágios naturais do desenvolvimento psicológico da criança e do adolescente:

1. **A Fase do Papagaio (Gramática):** a idade em que a memorização de cantos, poemas, declinações latinas, fatos bíblicos e narrativas históricas é prazerosa e natural.
2. **A Fase Pertinaz (Dialética / Lógica):** quando o jovem começa a questionar causas, apontar contradições e precisa aprender a construir silogismos válidos e detectar falácias.
3. **A Fase Poética (Retórica):** quando o estudante aprende a expressar a verdade compreendida com elegância, clareza e força persuasiva.`,
    notable_quotes: [
      {
        id: 8,
        quote_text:
          'O objetivo único da educação é ensinar o aluno a aprender por si mesmo; qualquer instrução que não alcance isso é esforço vão.',
        source_note: 'Conferência de Oxford, 1947',
      },
    ],
    affiliate_url:
      'https://www.amazon.com.br/s?k=Trivium+Educacao+Classica+Artes+Liberais',
    affiliate_cta_label: 'Adquirir Obras do Trivium na Amazon',
    affiliate_price_hint: 'Coleção Artes Liberais • R$ 58,00',
    affiliate_clicks_count: 97,
    isbn_or_ref: 'Oxford Address Series • Edição Comentada',
    publisher_or_studio: 'Kirion / É Realizações',
    is_featured: true,
    editorial_rating: 4.8,
    reviews_count: 11,
    status: 'APPROVED',
    submitted_by_id: 2,
    submitted_by: DEMO_USERS.MODERATOR,
    created_at: '2026-10-18T08:00:00Z',
    comments: [],
  },
  {
    id: 6,
    title: 'Paixão Segundo São Mateus, BWV 244',
    subtitle: 'O Ápice da Polifonia Sacra Barroca e da Exegese Musical Luterana',
    slug: 'paixao-segundo-sao-mateus-js-bach',
    creator: 'Johann Sebastian Bach (Regência: Philippe Herreweghe / Collegium Vocale Gent)',
    media_type: 'SACRED_ART',
    release_year: 1727,
    category_id: 3,
    category: INITIAL_CATEGORIES[2],
    cover_url:
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=85',
    synopsis: `Composta para a Sexta-Feira Santa na Igreja de São Tomás em Leipzig, a *Matthäus-Passion* (BWV 244) para duplo coro e dupla orquestra é frequentemente chamada de "Quinto Evangelho". Bach entrelaça a narrativa literal dos capítulos 26 e 27 de São Mateus com a poesia devocional de Picander e os corais comunitários da tradição alemã.

> Erbarme dich, mein Gott, um meiner Zähren willen! (Tem piedade, meu Deus, por causa das minhas lágrimas!)

## A Arquitetura Musical como Teologia

Na ária para contralto e violino solo *Erbarme dich*, executada imediatamente após o choro amargo de Pedro por ter negado a Cristo três vezes, a linha melódica do violino obbligato desenha um diálogo de compaixão onde a técnica contrapontística mais rigorosa se converte em pura oração.`,
    notable_quotes: [
      {
        id: 9,
        quote_text:
          'O fim e a razão última de toda música não deve ser outro senão a glória de Deus e a recreação do espírito.',
        source_note: 'J. S. Bach — Preceito de Baixo Contínuo (1738)',
      },
    ],
    affiliate_url:
      'https://www.amazon.com.br/s?k=Bach+St+Matthew+Passion+Herreweghe+CD+Vinil',
    affiliate_cta_label: 'Adquirir Gravação & Partitura na Amazon',
    affiliate_price_hint: 'Box 3 CDs Harmonia Mundi / Partitura Bärenreiter',
    affiliate_clicks_count: 78,
    isbn_or_ref: 'BWV 244 • Harmonia Mundi HMC 901676',
    publisher_or_studio: 'Harmonia Mundi / Bärenreiter',
    is_featured: false,
    editorial_rating: 5.0,
    reviews_count: 9,
    status: 'APPROVED',
    submitted_by_id: 1,
    submitted_by: DEMO_USERS.ADMIN,
    created_at: '2026-10-20T19:00:00Z',
    comments: [],
  },
];

export const INITIAL_TOPICS: Topic[] = [
  {
    id: 1,
    title: 'O conceito de "Subcriação" e "Eucatástrofe" no ensaio Sobre Histórias de Fadas, de J.R.R. Tolkien',
    slug: 'subcriacao-e-eucatastrofe-em-tolkien',
    excerpt:
      'Como Tolkien articula a vocação poética humana à imagem do Criador e por que os Evangelhos contêm a maior de todas as eucatástrofes da história.',
    body: `Ao longo de sua célebre conferência *On Fairy-Stories* (proferida na Universidade de St Andrews em 1939), J.R.R. Tolkien oferece a mais profunda teologia da imaginação literária do século XX.

Para os críticos materialistas que acusavam a literatura fantástica de "escapismo", Tolkien responde com uma distinção memorável: não se deve confundir a fuga do prisioneiro com a deserção do soldado. Quando um homem está trancado em uma cela cinzenta e reduzida, falar de árvores, estrelas, reis e dragões não é covardia, mas lucidez e resistência.

> Fazemos em nossa medida e em nosso modo derivado, porque fomos feitos: e não apenas feitos, mas feitos à imagem e semelhança de um Criador.

## A Eucatástrofe e a Alegria que Transpassa o Coração

No Epílogo de seu ensaio, Tolkien cunha o termo **Eucatástrofe** — a súbita e alegre reviravolta quando tudo parece irremediavelmente perdido — e argumenta que essa consolação não nega a existência da dor ou do fracasso (*dyscatastrophe*), mas nega a derrota final universal.

Mais ainda: Tolkien conclui que os Evangelhos não aboliram as lendas antigas, mas as santificaram. Na Encarnação e na Ressurreição de Cristo, o Autor Primário entrou na História, e a Lenda e a Verdade Histórica encontraram-se definitivamente.

Como vocês trabalham essa compreensão de *subcriação* na leitura literária com seus filhos ou alunos?`,
    category_id: 1,
    category: INITIAL_CATEGORIES[0],
    work_id: 1,
    work: INITIAL_WORKS[0],
    author_id: 1,
    author: DEMO_USERS.ADMIN,
    is_pinned: true,
    views_count: 642,
    upvotes_count: 58,
    comments_count: 14,
    tags: ['Tolkien', 'Mitopoese', 'Estética Cristã', 'Inklings'],
    status: 'APPROVED',
    created_at: '2026-10-25T14:00:00Z',
    comments: [
      {
        id: 201,
        body: `O poema *Mythopoeia*, que Tolkien escreveu justamente após a famosa conversa noturna em Addison's Walk com C.S. Lewis e Hugo Dyson em setembro de 1931, sintetiza essa visão de forma sublime:

> O homem, subcriador, a luz refratada / através de quem se divide em matizes a Única Branca / em muitas cores, que se combinam sem cessar / em formas vivas que se movem de mente em mente.`,
        work_id: null,
        topic_id: 1,
        parent_id: null,
        author_id: 2,
        author: DEMO_USERS.MODERATOR,
        upvotes_count: 19,
        status: 'APPROVED',
        created_at: '2026-10-25T16:10:00Z',
        replies: [],
      },
    ],
  },
  {
    id: 2,
    title: 'Ordo Amoris e a Educação da Imaginação Moral: Por onde começar um currículo clássico doméstico?',
    slug: 'ordo-amoris-curriculo-classico-domestico',
    excerpt:
      'Guia prático de transição para famílias e tutores: como harmonizar a leitura de "livros vivos" (Charlotte Mason) com o rigor gramatical do Trivium.',
    body: `Muitas famílias que despertam para a beleza da Educação Clássica sentem-se inicialmente intimidadas pela vastidão da tradição: devemos começar pelo estudo formal do Latim, pela leitura em voz alta das fábulas de Esopo e Plutarco, ou pela contemplação de quadros e música sacra?

Na tradição patrística e medieval, antes da análise lógica vem o encantamento poético e musical (a *Mousiké* dos antigos, batizada pelos Padres Capadócios e por Santo Agostinho).

> A virtude é a ordem do amor (Virtus est ordo amoris). — Santo Agostinho, A Cidade de Deus, XV.22

## O Hábito da Narração e os Livros Vivos

Quando Charlotte Mason insiste em substituir compêndios áridos por **livros vivos** (*living books*) escritos por autores que amam profundamente seu tema, e pede à criança que faça a *narração oral* daquilo que acabou de ouvir, ela está praticando a forma mais pura de atenção intelectual.

Compartilho nossa grade de leituras para o ciclo fundamental (7 a 11 anos) e gostaria de ouvir a experiência dos demais preceptores desta comunidade.`,
    category_id: 2,
    category: INITIAL_CATEGORIES[1],
    work_id: 2,
    work: INITIAL_WORKS[1],
    author_id: 2,
    author: DEMO_USERS.MODERATOR,
    is_pinned: true,
    views_count: 489,
    upvotes_count: 47,
    comments_count: 19,
    tags: ['Educação Clássica', 'Charlotte Mason', 'Trivium', 'Homeschooling'],
    status: 'APPROVED',
    created_at: '2026-10-27T09:45:00Z',
    comments: [],
  },
  {
    id: 3,
    title: 'O Tempo Esculpido: A dimensão sacramental e a nostalgia do absoluto no cinema de Andrei Tarkovski',
    slug: 'dimensao-sacramental-cinema-andrei-tarkovski',
    excerpt:
      'De Andrei Rublev a O Sacrifício: uma análise de como a lentidão contemplativa resgata o olhar moderno da fragmentação.',
    body: `Em seu livro teórico *Esculpir o Tempo*, Andrei Tarkovski afirma que a função da arte não é impor ideias nem distrair o espectador, mas "preparar a alma humana para a recepção do Bem".

> A imagem artística é sempre um símbolo do absoluto, uma tentativa de capturar o infinito dentro do finito.

Quando assistimos ao prólogo e ao epílogo de *Andrei Rublev* — quando a tela em preto e branco finalmente se abre para as cores vibrantes do ícone da Santíssima Trindade —, compreendemos o que significa cinema espiritual sem artificialismo.`,
    category_id: 3,
    category: INITIAL_CATEGORIES[2],
    work_id: 3,
    work: INITIAL_WORKS[2],
    author_id: 3,
    author: DEMO_USERS.MEMBER,
    is_pinned: false,
    views_count: 315,
    upvotes_count: 34,
    comments_count: 9,
    tags: ['Tarkovski', 'Cinema Contemplativo', 'Iconografia', 'Estética'],
    status: 'APPROVED',
    created_at: '2026-10-29T20:15:00Z',
    comments: [],
  },
  {
    id: 4,
    title: 'A Vida Intelectual (A.-D. Sertillanges) e a disciplina do silêncio na era da dispersão digital',
    slug: 'a-vida-intelectual-sertillanges-disciplina-do-silencio',
    excerpt:
      'Como cultivar duas horas diárias de estudo profundo e leitura contemplativa em meio às demandas profissionais contemporâneas.',
    body: `O Padre Antonin-Dalmace Sertillanges, OP, escreveu em *A Vida Intelectual* que o estudioso cristão não precisa necessariamente de oito horas livres por dia, mas de **duas horas sagradas de recolhimento inegociável**.

> Duas horas por dia, mas duas horas do coração do dia, consagradas com fidelidade litúrgica ao estudo da verdade, bastam para construir uma obra fecunda.

Quais hábitos concretos de leitura em papel, fichamento em caderno físico (*Commonplace Book*) e jejum digital vocês têm praticado neste ano?`,
    category_id: 4,
    category: INITIAL_CATEGORIES[3],
    work_id: null,
    work: null,
    author_id: 1,
    author: DEMO_USERS.ADMIN,
    is_pinned: false,
    views_count: 410,
    upvotes_count: 51,
    comments_count: 22,
    tags: ['Sertillanges', 'Vida Intelectual', 'Commonplace Book', 'Vocação'],
    status: 'APPROVED',
    created_at: '2026-11-02T07:30:00Z',
    comments: [],
  },
];

export const INITIAL_MODERATION_FLAGS: ModerationFlag[] = [
  {
    id: 1,
    target_type: 'COMMENT',
    target_id: 901,
    target_title: 'Comentário em "Confissões — Santo Agostinho"',
    target_excerpt:
      'Ganhe renda extra rápida trabalhando em casa com criptomoedas! Acesse agora nosso link promocional no perfil...',
    target_author_id: 99,
    target_author_name: 'crypto_bot_2026',
    reporter_id: 3,
    reporter_name: 'Lucas Albuquerque',
    reason: 'SPAM',
    details: 'Spam comercial automatizado completamente alheio à discussão patrística.',
    status: 'PENDING',
    created_at: '2026-11-09T18:20:00Z',
  },
  {
    id: 2,
    target_type: 'TOPIC',
    target_id: 902,
    target_title: 'Polêmica partidária e ataques pessoais a membros da cátedra',
    target_excerpt:
      'Quem discorda da minha posição político-eleitoral imediata não passa de um ignorante mal-intencionado...',
    target_author_id: 98,
    target_author_name: 'polemista_anonimo',
    reporter_id: 2,
    reporter_name: 'Helena Monteiro de Barros',
    reason: 'GUIDELINE_VIOLATION',
    details:
      'Fere a Carta de Princípios da comunidade (caridade cristã, sobriedade acadêmica e proibição de ataques ad hominem).',
    status: 'PENDING',
    created_at: '2026-11-09T19:45:00Z',
  },
  {
    id: 3,
    target_type: 'WORK',
    target_id: 903,
    target_title: 'Indicação de Obra: Didascalicon — Da Arte de Ler (Hugo de São Vítor)',
    target_excerpt:
      'Tratado pedagógico do século XII sobre a ordem e o método das leituras filosóficas e sagradas na Abadia de São Vítor.',
    target_author_id: 3,
    target_author_name: 'Lucas Albuquerque',
    reporter_id: 3,
    reporter_name: 'Fila Automática de Curadoria',
    reason: 'BROKEN_AFFILIATE_LINK',
    details:
      'Nova submissão comunitária aguardando revisão editorial e validação da tag de afiliado Amazon.',
    status: 'PENDING',
    created_at: '2026-11-09T21:10:00Z',
  },
];
