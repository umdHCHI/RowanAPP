import React from 'react';
import {
    Dimensions,
    Icon,
    LinearGradient,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from '../imports';

const { width, height } = Dimensions.get('window');

interface AttributeInfoModalProps {
  visible: boolean;
  onClose: () => void;
  attribute: {
    label: string;
    value: number;
    maxValue?: number;
    color: string;
    icon?: string;
  } | null;
}

// Attribute descriptions with college stress correlations
const attributeInfo = {
  awareness: {
    title: "Awareness",
    icon: "🧘",
    description: "Your ability to recognize and understand your thoughts, emotions, and stress triggers in real-time.",
    benefits: [
      "Identify stress patterns before they overwhelm you",
      "Recognize early warning signs of burnout",
      "Understand your emotional responses to academic pressure",
      "Develop better self-regulation skills"
    ],
    collegeStressCorrelation: {
      title: "How Awareness Helps with College Stress:",
      points: [
        "🎯 **Academic Pressure**: Awareness helps you notice when study habits become counterproductive, allowing you to adjust before burning out.",
        "⏰ **Time Management**: By being aware of your energy patterns, you can schedule demanding tasks when you're most focused.",
        "🤝 **Social Stress**: Understanding your social battery helps you balance social activities with alone time for recharging.",
        "💰 **Financial Anxiety**: Awareness of spending triggers helps you make mindful financial decisions and reduce money-related stress.",
        "🔮 **Future Planning**: Recognizing anxiety about post-graduation plans allows you to address career concerns proactively."
      ]
    },
    realWorldApplication: "Students with higher awareness report 40% less academic stress and better emotional regulation during exam periods."
  },
  resilience: {
    title: "Resilience",
    icon: "💪",
    description: "Your capacity to bounce back from setbacks, adapt to challenges, and maintain stability during difficult times.",
    benefits: [
      "Recover more quickly from academic failures",
      "Maintain motivation despite obstacles",
      "Adapt to unexpected changes in life",
      "Build confidence through overcoming challenges"
    ],
    collegeStressCorrelation: {
      title: "How Resilience Helps with College Stress:",
      points: [
        "📚 **Academic Setbacks**: Resilience helps you bounce back from poor grades or failed exams without giving up on your goals.",
        "🏠 **Homesickness**: Strong resilience helps you adapt to being away from family and build new support systems.",
        "💔 **Relationship Issues**: When friendships or romantic relationships face challenges, resilience helps you cope and grow.",
        "🎓 **Imposter Syndrome**: Resilient students better handle feelings of not belonging or not being 'smart enough' for college.",
        "🌊 **Life Transitions**: Major changes like switching majors or transferring schools become more manageable with resilience."
      ]
    },
    realWorldApplication: "Research shows resilient college students are 60% more likely to persist through academic challenges and graduate on time."
  },
  connection: {
    title: "Connection",
    icon: "🤝",
    description: "Your ability to build and maintain meaningful relationships, seek support when needed, and contribute to your community.",
    benefits: [
      "Build a strong support network for tough times",
      "Develop lasting friendships and mentorships",
      "Improve communication and conflict resolution skills",
      "Find belonging and purpose in your community"
    ],
    collegeStressCorrelation: {
      title: "How Connection Helps with College Stress:",
      points: [
        "👥 **Social Isolation**: Strong connections combat loneliness, which is a major contributor to college depression and anxiety.",
        "📖 **Study Support**: Connected students form study groups, share resources, and help each other through difficult courses.",
        "🆘 **Crisis Support**: When facing mental health challenges, connected students are more likely to seek help and receive support.",
        "🎯 **Career Networking**: Social connections often lead to internships, job opportunities, and career guidance.",
        "🏆 **Academic Collaboration**: Group projects and peer learning become less stressful when you have strong interpersonal skills."
      ]
    },
    realWorldApplication: "Students with strong social connections report 50% lower levels of anxiety and are 3x more likely to seek help when struggling."
  },
  balance: {
    title: "Balance",
    icon: "⚖️",
    description: "Your ability to manage competing demands, maintain healthy boundaries, and create sustainable routines.",
    benefits: [
      "Prevent burnout through sustainable habits",
      "Maintain physical and mental health",
      "Create space for both work and personal fulfillment",
      "Develop long-term life management skills"
    ],
    collegeStressCorrelation: {
      title: "How Balance Helps with College Stress:",
      points: [
        "📚 **Academic Overwhelm**: Balance prevents you from over-studying to the point of diminishing returns and burnout.",
        "💼 **Work-Study Balance**: Managing part-time jobs alongside coursework becomes sustainable with good balance skills.",
        "🎉 **Social vs Academic**: Balanced students enjoy social activities without guilt and study effectively without FOMO.",
        "💤 **Sleep & Health**: Balance includes prioritizing sleep, exercise, and nutrition even during busy periods.",
        "🎯 **Perfectionism**: Balanced students know when 'good enough' is actually good enough, reducing perfectionist stress."
      ]
    },
    realWorldApplication: "Balanced college students report 45% better sleep quality and 35% higher academic satisfaction compared to unbalanced peers."
  },
  fear: {
    title: "Fear Management",
    icon: "🛡️",
    description: "Your ability to acknowledge, face, and work through fears and anxieties rather than being controlled by them.",
    benefits: [
      "Reduce avoidance behaviors that limit growth",
      "Build courage to face challenging situations",
      "Develop healthy coping strategies for anxiety",
      "Transform fear into motivation and preparation"
    ],
    collegeStressCorrelation: {
      title: "How Fear Management Helps with College Stress:",
      points: [
        "🎓 **Academic Fears**: Managing fear of failure helps you take on challenging courses and pursue opportunities without being paralyzed by 'what if' scenarios.",
        "🗣️ **Social Anxieties**: Overcoming fear of judgment allows you to participate in class discussions, join clubs, and form meaningful relationships.",
        "💼 **Career Uncertainty**: Fear management helps you explore internships and career paths without being overwhelmed by future unknowns.",
        "🏠 **Independence Fears**: Managing anxiety about living independently helps you develop life skills and confidence away from home.",
        "📈 **Performance Anxiety**: Learning to work with test anxiety and presentation fears improves academic performance and reduces stress."
      ]
    },
    realWorldApplication: "Students who develop healthy fear management strategies report 55% less test anxiety and are twice as likely to pursue challenging opportunities."
  },
  exploration: {
    title: "Exploration & Curiosity", 
    icon: "🧭",
    description: "Your willingness to seek new experiences, learn from different perspectives, and step outside your comfort zone for growth.",
    benefits: [
      "Discover new interests and potential career paths",
      "Build adaptability and openness to change", 
      "Develop problem-solving through diverse experiences",
      "Create a rich network of connections and opportunities"
    ],
    collegeStressCorrelation: {
      title: "How Exploration Helps with College Stress:",
      points: [
        "🎯 **Major Selection**: Exploration helps you discover your true interests and find a major that genuinely excites you, reducing academic stress.",
        "🌐 **Social Connection**: Trying new activities and joining diverse groups helps you find your tribe and combat loneliness.",
        "💡 **Academic Growth**: Exploring different subjects and learning styles helps you find what works best for your academic success.",
        "🔄 **Adaptability**: Regular exploration builds resilience and comfort with change, making college transitions less stressful.",
        "🎨 **Stress Relief**: Exploring hobbies and creative outlets provides healthy ways to decompress from academic pressure."
      ]
    },
    realWorldApplication: "Students who actively explore report 40% higher satisfaction with their college experience and better career clarity upon graduation."
  },
  courage: {
    title: "Courage & Bravery",
    icon: "⚔️", 
    description: "Your ability to act with bravery in the face of challenges, stand up for your values, and take positive risks for growth.",
    benefits: [
      "Take on leadership roles and new challenges",
      "Stand up for yourself and others when needed",
      "Pursue opportunities despite uncertainty",
      "Build confidence through brave actions"
    ],
    collegeStressCorrelation: {
      title: "How Courage Helps with College Stress:",
      points: [
        "🎤 **Speaking Up**: Courage helps you ask questions in class, seek help when struggling, and advocate for your academic needs.",
        "👥 **Social Courage**: Being brave in social situations helps you set boundaries, end toxic relationships, and pursue meaningful connections.",
        "📚 **Academic Risks**: Courage allows you to take challenging courses, pursue research opportunities, and apply for competitive programs.",
        "💪 **Self-Advocacy**: Being brave helps you communicate with professors, seek mental health support, and access campus resources.",
        "🎯 **Goal Pursuit**: Courage enables you to pursue ambitious goals despite fear of failure or judgment from others."
      ]
    },
    realWorldApplication: "Courageous students are 50% more likely to seek help when needed and report higher levels of personal growth during college."
  }
};

const AttributeInfoModal: React.FC<AttributeInfoModalProps> = ({
  visible,
  onClose,
  attribute,
}) => {
  if (!attribute || !visible) return null;

  const attributeKey = attribute.label.toLowerCase() as keyof typeof attributeInfo;
  const info = attributeInfo[attributeKey];

  if (!info) return null;

  const currentLevel = Math.floor((attribute.value || 0) / 5) + 1;
  const maxValue = attribute.maxValue || 20;
  const progressPercent = ((attribute.value || 0) / maxValue) * 100;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#2d1b47', '#1a1a1a']}
          style={styles.modalGradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.attributeIcon}>{info.icon}</Text>
              <View>
                <Text style={styles.headerTitle}>{info.title}</Text>
                <Text style={styles.headerSubtitle}>
                  Level {currentLevel} • {attribute.value}/{maxValue}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#4ee6e6" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[attribute.color, attribute.color + '80']}
                style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercent)}% Complete
            </Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What is {info.title}?</Text>
              <Text style={styles.description}>{info.description}</Text>
            </View>

            {/* Benefits */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Benefits</Text>
              {info.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* College Stress Correlation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{info.collegeStressCorrelation.title}</Text>
              {info.collegeStressCorrelation.points.map((point, index) => (
                <View key={index} style={styles.stressCorrelationItem}>
                  <Text style={styles.stressCorrelationText}>{point}</Text>
                </View>
              ))}
            </View>

            {/* Real World Application */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Research Evidence</Text>
              <View style={styles.researchBox}>
                <Icon name="book" size={20} color="#d4af37" style={styles.researchIcon} />
                <Text style={styles.researchText}>{info.realWorldApplication}</Text>
              </View>
            </View>

            {/* Level Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <View style={styles.levelProgressContainer}>
                <Text style={styles.levelProgressText}>
                  You're currently at Level {currentLevel} in {info.title}.
                </Text>
                {currentLevel < 4 && (
                  <Text style={styles.levelProgressSubtext}>
                    Keep engaging with stories and completing activities to strengthen this foundation!
                  </Text>
                )}
                {currentLevel >= 4 && (
                  <Text style={styles.levelProgressSubtext}>
                    Excellent! You've mastered this foundation. Your {info.title.toLowerCase()} skills are strong.
                  </Text>
                )}
              </View>
            </View>

            {/* Bottom padding for scroll */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(78, 230, 230, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attributeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ee6e6',
    fontFamily: 'serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 12,
    fontFamily: 'serif',
  },
  description: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    color: '#4ee6e6',
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    color: '#e0e0e0',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  stressCorrelationItem: {
    backgroundColor: 'rgba(78, 230, 230, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ee6e6',
  },
  stressCorrelationText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
  },
  researchBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#d4af37',
  },
  researchIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  researchText: {
    color: '#e0e0e0',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  levelProgressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
  },
  levelProgressText: {
    color: '#4ee6e6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelProgressSubtext: {
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default AttributeInfoModal;
