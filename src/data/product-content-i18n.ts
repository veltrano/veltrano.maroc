import type { Fit } from "@/data/catalog";
import {
  contentForSlug,
  type ProductBenefit,
  type ProductContent,
  type ProductFaq,
} from "@/data/product-content";

export type ProductContentLocale = "fr" | "ar";

function colourTitle(colour: string) {
  return colour
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const BAGGY_BENEFITS_AR: ProductBenefit[] = [
  { label: "قصّة واسعة", text: "مساحة أوسع حول الساقين وإطلالة ذات طابع مميّز." },
  { label: "قطن 100٪", text: "تركيبة واضحة تساعدك على اختيار الجينز المناسب لك." },
  {
    label: "تشطيبات راقية",
    text: "تفاصيل يمكنك استكشافها عن قرب في صور المنتج.",
  },
];

const STRAIGHT_BENEFITS_AR: ProductBenefit[] = [
  { label: "قصّة مستقيمة", text: "خطوط واضحة لإطلالة يسهل تنسيقها." },
  {
    label: "98٪ قطن و2٪ إيلاستين",
    text: "طابع القطن مع لمسة من المرونة.",
  },
  {
    label: "تنسيقات متعددة",
    text: "من التيشيرت إلى القميص، أكثر من طريقة لارتداء الجينز نفسه.",
  },
];

const SHARED_SERVICE_FAQS_AR: ProductFaq[] = [
  {
    question: "هل التوصيل مجاني؟",
    answer: "نعم، التوصيل مجاني داخل المغرب.",
  },
  {
    question: "ماذا لو لم يناسبني المقاس؟",
    answer:
      "يمكنك طلب استبدال المقاس مجانًا خلال 7 أيام من استلام طلبك. تواصل مع فريقنا لتنظيم الاستبدال.",
  },
  {
    question: "كيف أطلب إرجاعًا؟",
    answer:
      "تُقبل الإرجاعات خلال 7 أيام من التسليم، إذا كان المنتج غير مستعمل وفي حالته الأصلية. تواصل مع فريقنا لمعرفة الإجراءات.",
  },
  {
    question: "كيف أعتني بجينزي؟",
    answer: "اتبع إرشادات العناية الموجودة على ملصق الجينز.",
  },
  {
    question: "هل يمكنني اختيار لونين أو مقاسين مختلفين في العرض؟",
    answer:
      "عرض القطعتين ينطبق على الموديل نفسه (نفس اللون). يمكنك اختيار مقاس مختلف لكل جينز في العرض.",
  },
  {
    question: "ما الفرق بين الباجي والقصّة المستقيمة؟",
    answer:
      "الباجي قصّة واسعة وإطلالة كاجوال بقطن 100٪. القصّة المستقيمة خطوط واضحة، بتركيبة 98٪ قطن و2٪ إيلاستين للمسة من المرونة.",
  },
];

type ColourRowAr = {
  slug: string;
  colour: string;
  colourSentence: string;
};

const BAGGY_COLOURS_AR: ColourRowAr[] = [
  {
    slug: "baggy-jean-bleu-blith",
    colour: "bleu blith",
    colourSentence:
      "يقدّم لون Bleu Blith أزرق دنيم واضحًا، مناسبًا لإطلالة كاجوال مرتّبة.",
  },
  {
    slug: "baggy-jean-dorty",
    colour: "dorty",
    colourSentence:
      "يميل لون Dorty إلى بيج-رمادي حجري، سهل التنسيق مع الألوان المحايدة.",
  },
  {
    slug: "baggy-jean-double-stone",
    colour: "double stone",
    colourSentence:
      "يقدّم Double Stone رماديًا حجريًا متدرّجًا لإطلالة حضرية هادئة.",
  },
  {
    slug: "baggy-jean-gris-snow",
    colour: "gris snow",
    colourSentence:
      "Gris Snow رمادي فاتح مغسول، يضفي إشراقًا على القصّة الواسعة.",
  },
  {
    slug: "baggy-jean-noir",
    colour: "noir",
    colourSentence:
      "يؤكّد لون Noir حضورًا واضحًا: قاعدة قوية لإطلالات المساء كما اليومية.",
  },
  {
    slug: "baggy-jean-stone",
    colour: "stone",
    colourSentence:
      "يقدّم Stone رماديًا بيجيًا حجريًا كلاسيكيًا، متعدّد الاستخدامات على مدار السنة.",
  },
];

const STRAIGHT_COLOURS_AR: ColourRowAr[] = [
  {
    slug: "straight-fit-jean-dorty",
    colour: "dorty",
    colourSentence:
      "يمنح لون Dorty تدرّجًا حجريًا دافئًا على قصّة مستقيمة مرتّبة.",
  },
  {
    slug: "straight-fit-jean-gris",
    colour: "gris",
    colourSentence:
      "يقدّم Gris دنيمًا رماديًا متوسطًا، سهل الارتداء مع حذاء رياضي أو قميص.",
  },
  {
    slug: "straight-fit-jean-gris-liga",
    colour: "gris liga",
    colourSentence:
      "يتميّز Gris Liga برمادي عميق بلمسة معدنية خفيفة.",
  },
  {
    slug: "straight-fit-jean-gris-noir",
    colour: "gris noir",
    colourSentence:
      "يقع Gris Noir بين الرمادي الداكن والأسود، لإطلالة هادئة.",
  },
  {
    slug: "straight-fit-jean-noir",
    colour: "noir",
    colourSentence:
      "يبرز لون Noir القصّة المستقيمة بتباين واضح وحضور مؤكَّد.",
  },
  {
    slug: "straight-fit-jean-stone",
    colour: "stone",
    colourSentence:
      "يمنح Stone رماديًا حجريًا ناعمًا على قصّة مستقيمة يسهل تنسيقها.",
  },
];

function baggyFaqsAr(): ProductFaq[] {
  return [
    {
      question: "ما هي التركيبة؟",
      answer: "قطن 100٪.",
    },
    {
      question: "كيف أختار مقاسي؟",
      answer:
        "راجع دليل مقاسات الباجي بجانب اختيار المقاس، ثم قارن القياسات A–D بجينزك المفضّل.",
    },
    ...SHARED_SERVICE_FAQS_AR,
  ];
}

function straightFaqsAr(): ProductFaq[] {
  return [
    {
      question: "ما هي التركيبة؟",
      answer: "98٪ قطن و2٪ إيلاستين.",
    },
    {
      question: "كيف أختار مقاسي؟",
      answer:
        "راجع دليل مقاسات القصّة المستقيمة بجانب اختيار المقاس، ثم قارن القياسات A–D بجينزك المفضّل.",
    },
    ...SHARED_SERVICE_FAQS_AR,
  ];
}

const BAGGY_SHORT_AR =
  "قصّة واسعة تمنحك حرية في الحركة، وإطلالة تعبّر عن شخصيتك. جينز باجي من القطن 100٪ بتشطيبات راقية، لتنسّق إطلالة كاجوال على ذوقك.";

const BAGGY_LONG_BASE_AR =
  "يمنح جينز باجي من Veltrano إطلالتك طابعًا واضحًا، مع مساحة أوسع حول الساقين. يجمع بين دنيم من القطن 100٪ وتشطيبات راقية تظهر في تفاصيل القطعة.";

const BAGGY_LONG_TAIL_AR =
  "نسّقه مع تيشيرت وحذاء رياضي لإطلالة كاجوال، أو مع قميص لإطلالة أكثر أناقة. اختر اللون الذي يناسبك، وتصفّح صور المنتج ودليل المقاسات لتجد المقاس المناسب لك.";

const STRAIGHT_SHORT_AR =
  "قصّة مستقيمة، وإطلالة مرتّبة، ولمسة من المرونة ترافق حركتك. جينز Veltrano بتركيبة 98٪ قطن و2٪ إيلاستين، لتنسّقه مع إطلالاتك الكاجوال أو الأكثر أناقة.";

const STRAIGHT_LONG_BASE_AR =
  "يمنحك جينز Veltrano بقصّته المستقيمة إطلالة مرتّبة يسهل تنسيقها. تجمع تركيبته بين 98٪ قطن و2٪ إيلاستين، لتضيف لمسة من المرونة إلى الدنيم وترافق حركتك اليومية.";

const STRAIGHT_LONG_TAIL_AR =
  "ارتده مع تيشيرت وحذاء رياضي لإطلالة كاجوال، أو مع قميص لإطلالة أكثر أناقة. اختر اللون الذي يناسب ذوقك، وراجع صور المنتج ودليل المقاسات قبل اختيار مقاسك.";

function buildBaggyAr(row: ColourRowAr): ProductContent {
  const colourLabel = colourTitle(row.colour);
  const title = `جينز باجي بقصّة واسعة — ${colourLabel}`;
  return {
    slug: row.slug,
    fit: "baggy",
    colourLabel,
    title,
    h1: title,
    shortDescription: BAGGY_SHORT_AR,
    longDescription: `${BAGGY_LONG_BASE_AR} ${row.colourSentence} ${BAGGY_LONG_TAIL_AR}`,
    composition: "قطن 100٪",
    compositionShort: "قطن 100٪",
    benefits: BAGGY_BENEFITS_AR,
    detailTitle: "راحة القصّة الواسعة. وطابع الدنيم.",
    detailCopy:
      "يمنح الحجم طابع الإطلالة. ويكمل اللون والتشطيبات المظهر. استكشف الصور أثناء الارتداء والتفاصيل ودليل المقاسات لاختيار الباجي المناسب لقامتك.",
    colourSentence: row.colourSentence,
    seoTitle: `جينز باجي ${colourLabel} قطن 100٪ | Veltrano`,
    metaDescription: `اكتشف جينز الباجي ${colourLabel} من Veltrano: قطن 100٪، قصّة واسعة وتشطيبات راقية. توصيل مجاني داخل المغرب.`,
    imageAltFlat: `جينز باجي ${colourLabel} من Veltrano، صورة أمامية مسطّحة`,
    imageAltWorn: `جينز باجي ${colourLabel} من Veltrano، صورة أثناء الارتداء`,
    faqs: baggyFaqsAr(),
  };
}

function buildStraightAr(row: ColourRowAr): ProductContent {
  const colourLabel = colourTitle(row.colour);
  const title = `جينز بقصّة مستقيمة — ${colourLabel}`;
  return {
    slug: row.slug,
    fit: "straight",
    colourLabel,
    title,
    h1: title,
    shortDescription: STRAIGHT_SHORT_AR,
    longDescription: `${STRAIGHT_LONG_BASE_AR} ${row.colourSentence} ${STRAIGHT_LONG_TAIL_AR}`,
    composition: "98٪ قطن و2٪ إيلاستين",
    compositionShort: "98٪ قطن و2٪ إيلاستين",
    benefits: STRAIGHT_BENEFITS_AR,
    detailTitle: "خطوط واضحة. ولمسة من المرونة.",
    detailCopy:
      "قصّة مستقيمة وتركيبة بمرونة خفيفة: مرجعان لاختيار جينزك. راجع الصور أثناء الارتداء وقياسات الموديل قبل اختيار مقاسك.",
    colourSentence: row.colourSentence,
    seoTitle: `جينز بقصّة مستقيمة ${colourLabel} 98٪ قطن | Veltrano`,
    metaDescription: `جينز بقصّة مستقيمة ${colourLabel} من Veltrano: 98٪ قطن و2٪ إيلاستين للمسة من المرونة. اعثر على مقاسك. توصيل مجاني داخل المغرب.`,
    imageAltFlat: `جينز بقصّة مستقيمة ${colourLabel} من Veltrano، صورة أمامية مسطّحة`,
    imageAltWorn: `جينز بقصّة مستقيمة ${colourLabel} من Veltrano، صورة أثناء الارتداء`,
    faqs: straightFaqsAr(),
  };
}

export const PRODUCT_CONTENT_AR: ProductContent[] = [
  ...BAGGY_COLOURS_AR.map(buildBaggyAr),
  ...STRAIGHT_COLOURS_AR.map(buildStraightAr),
];

export const PRODUCT_CONTENT_AR_BY_SLUG: Record<string, ProductContent> =
  Object.fromEntries(PRODUCT_CONTENT_AR.map((c) => [c.slug, c]));

export function getProductContent(
  slug: string,
  locale: ProductContentLocale
): ProductContent | undefined {
  if (locale === "ar") {
    return PRODUCT_CONTENT_AR_BY_SLUG[slug];
  }
  return contentForSlug(slug);
}

export function fitLabelLocalized(fit: Fit, locale: ProductContentLocale) {
  if (locale === "ar") {
    return fit === "baggy" ? "باجي" : "قصّة مستقيمة";
  }
  return fit === "baggy" ? "Baggy" : "Coupe droite";
}
