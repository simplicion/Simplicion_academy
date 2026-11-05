'use client';

import React from 'react';
import { CbtSimulator } from '../../../../../components/CbtSimulator';
import { Question } from '@simplicion/assessment';

const cuetExamQuestions: Question[] = [
  {
    id: 'q-cuet-01',
    type: 'single_choice',
    textEn: 'Which of the following events is commonly regarded as the starting point of the Cold War?',
    textHi: 'निम्नलिखित में से किस घटना को आमतौर पर शीतयुद्ध का प्रारंभिक बिंदु माना जाता है?',
    options: [
      { id: 'optA', textEn: 'Cuban Missile Crisis (1962)', textHi: 'क्यूबा मिसाइल संकट (1962)' },
      { id: 'optB', textEn: 'Truman Doctrine & Marshall Plan (1947)', textHi: 'ट्रूमैन सिद्धांत और मार्शल योजना (1947)' },
      { id: 'optC', textEn: 'Fall of the Berlin Wall (1989)', textHi: 'बर्लिन की दीवार का गिरना (1989)' },
      { id: 'optD', textEn: 'Signing of the Warsaw Pact (1955)', textHi: 'वारसॉ संधि पर हस्ताक्षर (1955)' },
    ],
    correctOptionIds: ['optB'],
    marks: 4,
    negativeMarks: 1,
    explanationEn: 'The Truman Doctrine (1947), along with the Marshall Plan, formally initiated the United States containment policy against Soviet expansionism.',
    explanationHi: 'ट्रूमैन सिद्धांत (1947) और मार्शल योजना ने सोवियत विस्तारवाद के खिलाफ संयुक्त राज्य अमेरिका की रोकथाम नीति की औपचारिक शुरुआत की।',
  },
  {
    id: 'q-cuet-02',
    type: 'single_choice',
    textEn: 'Where was the first Non-Aligned Movement (NAM) Summit held in September 1961?',
    textHi: 'सितंबर 1961 में पहला गुटनिरपेक्ष आंदोलन (NAM) शिखर सम्मेलन कहाँ आयोजित किया गया था?',
    options: [
      { id: 'optA', textEn: 'New Delhi, India', textHi: 'नई दिल्ली, भारत' },
      { id: 'optB', textEn: 'Bandung, Indonesia', textHi: 'बांडुंग, इंडोनेशिया' },
      { id: 'optC', textEn: 'Belgrade, Yugoslavia', textHi: 'बेलग्रेड, यूगोस्लाविया' },
      { id: 'optD', textEn: 'Cairo, Egypt', textHi: 'काहिरा, मिस्र' },
    ],
    correctOptionIds: ['optC'],
    marks: 4,
    negativeMarks: 1,
    explanationEn: 'The first NAM Summit was attended by 25 member states and held in Belgrade, Yugoslavia in 1961.',
    explanationHi: 'पहले गुटनिरपेक्ष शिखर सम्मेलन में 25 सदस्य देशों ने भाग लिया और यह 1961 में बेलग्रेड, यूगोस्लाविया में आयोजित हुआ था।',
  },
  {
    id: 'q-cuet-03',
    type: 'single_choice',
    textEn: 'The term "Shock Therapy" in post-communist Russia primarily involved which economic reform?',
    textHi: 'उत्तर-साम्यवादी रूस में "शॉक थेरेपी" शब्द मुख्य रूप से किस आर्थिक सुधार से जुड़ा था?',
    options: [
      { id: 'optA', textEn: 'Abrupt transition from authoritarian socialist system to free-market capitalism', textHi: 'सत्तावादी समाजवादी व्यवस्था से मुक्त-बाजार पूंजीवाद में अचानक संक्रमण' },
      { id: 'optB', textEn: 'Gradual introduction of mixed economic models', textHi: 'मिश्रित आर्थिक मॉडल का क्रमिक परिचय' },
      { id: 'optC', textEn: 'Nationalization of all private heavy industries', textHi: 'सभी निजी भारी उद्योगों का राष्ट्रीयकरण' },
      { id: 'optD', textEn: 'Strict central state planning by Gosplan', textHi: 'गोसप्लान द्वारा सख्त केंद्रीय राज्य योजना' },
    ],
    correctOptionIds: ['optA'],
    marks: 4,
    negativeMarks: 1,
    explanationEn: 'Shock Therapy was the IMF and World Bank-backed radical transition from state socialism to free-market capitalism in the former Soviet states.',
    explanationHi: 'शॉक थेरेपी पूर्व सोवियत राज्यों में राज्य समाजवाद से मुक्त-बाजार पूंजीवाद की ओर आईएमएफ और विश्व बैंक द्वारा समर्थित आमूल-चूल परिवर्तन था।',
  },
  {
    id: 'q-cuet-04',
    type: 'single_choice',
    textEn: 'Who served as the first Chairman of the Planning Commission of India in 1950?',
    textHi: '1950 में भारत के योजना आयोग के पहले अध्यक्ष के रूप में किसने कार्य किया था?',
    options: [
      { id: 'optA', textEn: 'Dr. B.R. Ambedkar', textHi: 'डॉ. बी.आर. अंबेडकर' },
      { id: 'optB', textEn: 'Jawaharlal Nehru', textHi: 'जवाहरलाल नेहरू' },
      { id: 'optC', textEn: 'Sardar Vallabhbhai Patel', textHi: 'सरदार वल्लभभाई पटेल' },
      { id: 'optD', textEn: 'P.C. Mahalanobis', textHi: 'पी.सी. महालनोबिस' },
    ],
    correctOptionIds: ['optB'],
    marks: 4,
    negativeMarks: 1,
    explanationEn: 'The Prime Minister of India serves as the ex-officio Chairman of the Planning Commission (now NITI Aayog), making Jawaharlal Nehru its first Chairman in 1950.',
    explanationHi: 'भारत का प्रधानमंत्री योजना आयोग (अब नीति आयोग) का पदेन अध्यक्ष होता है, जिससे 1950 में जवाहरलाल नेहरू इसके पहले अध्यक्ष बने।',
  },
];

export default function CbtExamRunnerPage() {
  return (
    <CbtSimulator
      testTitle="CUET UG 2027 Sunday Full-Length Mock Series — Political Science Domain"
      durationMinutes={45}
      questions={cuetExamQuestions}
    />
  );
}

