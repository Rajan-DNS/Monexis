import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Linking,
  Share,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../../theme/colors';
import { Poppins } from '../../../theme/typography';
import {
  PRIVACY_POLICY_DATA,
  TERMS_CONDITIONS_DATA,
  REFUND_CANCELLATION_DATA,
  COOKIE_POLICY_DATA,
  ALL_LEGAL_DOCS,
  LegalDocData,
  LegalDocType,
  LegalSection,
} from './data/legalData';

const DOC_TABS: { key: LegalDocType; label: string; icon: string }[] = [
  { key: 'privacy', label: 'Privacy Policy', icon: 'security' },
  { key: 'terms', label: 'Terms of Service', icon: 'description' },
  { key: 'refund', label: 'Refund & Cancellation', icon: 'currency-exchange' },
  { key: 'cookie', label: 'Cookie Policy', icon: 'cookie' },
];

interface LegalDocumentScreenProps {
  route?: {
    params?: {
      initialTab?: LegalDocType;
      title?: string;
    };
  };
  navigation: any;
  defaultDoc?: LegalDocType;
}

const LegalDocumentScreen: React.FC<LegalDocumentScreenProps> = ({
  route,
  navigation,
  defaultDoc,
}) => {
  const getInitialDoc = (): LegalDocType => {
    if (defaultDoc) return defaultDoc;
    const tabParam = route?.params?.initialTab;
    if (tabParam && ['privacy', 'terms', 'refund', 'cookie'].includes(tabParam)) {
      return tabParam as LegalDocType;
    }
    const titleLower = route?.params?.title?.toLowerCase() || '';
    if (titleLower.includes('refund') || titleLower.includes('cancel')) return 'refund';
    if (titleLower.includes('cookie')) return 'cookie';
    if (titleLower.includes('term') || titleLower.includes('condition')) return 'terms';
    return 'privacy';
  };

  const [activeTab, setActiveTab] = useState<LegalDocType>(getInitialDoc);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (defaultDoc && defaultDoc !== activeTab) {
      setActiveTab(defaultDoc);
      setSelectedTag('All');
      setSearchQuery('');
    }
  }, [defaultDoc]);

  const currentDoc: LegalDocData = ALL_LEGAL_DOCS[activeTab] || PRIVACY_POLICY_DATA;

  // Extract unique tags for category filter chips
  const tags = useMemo(() => {
    const list = currentDoc.sections.map(s => s.tag);
    return ['All', ...Array.from(new Set(list))];
  }, [currentDoc]);

  // Filter sections based on search query and selected tag
  const filteredSections = useMemo(() => {
    let result = currentDoc.sections;

    if (selectedTag !== 'All') {
      result = result.filter(s => s.tag === selectedTag);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.tag.toLowerCase().includes(q) ||
          s.paragraphs.some(p => p.toLowerCase().includes(q)) ||
          s.bullets?.some(b => b.toLowerCase().includes(q)) ||
          s.numberedList?.some(n => n.toLowerCase().includes(q))
      );
    }

    return result;
  }, [currentDoc, selectedTag, searchQuery]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.monexis.store').catch(() => {});
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: currentDoc.title,
        message: `${currentDoc.title} - MONEXIS\nRead our official policies at https://${currentDoc.domain}`,
      });
    } catch (e) {
      // share dismissed
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#001F5B" />

      {/* Hero Header */}
      <LinearGradient
        colors={['#001438', '#001F5B', '#0047BA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        {/* Top Navigation Row */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.navButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={14} color="#38BDF8" />
              <Text style={styles.verifiedText}>OFFICIAL MONEXIS POLICY</Text>
            </View>
            <Text style={styles.headerMainTitle}>{currentDoc.title}</Text>
          </View>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.navButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="share" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Policy Tab Switcher: Privacy | Terms | Refund & Cancellation | Cookie Policy */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
          style={styles.tabsScrollView}
        >
          {DOC_TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const doc = ALL_LEGAL_DOCS[tab.key];
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => {
                  setActiveTab(tab.key);
                  setSelectedTag('All');
                  setSearchQuery('');
                }}
                activeOpacity={0.85}
              >
                <MaterialIcons
                  name={tab.icon}
                  size={16}
                  color={isActive ? '#001F5B' : 'rgba(255, 255, 255, 0.75)'}
                />
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    isActive ? styles.countBadgeActive : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countBadgeText,
                      isActive ? styles.countBadgeTextActive : styles.countBadgeTextInactive,
                    ]}
                  >
                    {doc?.sections?.length || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder={`Search within ${currentDoc.title}...`}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Main Content ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={event => {
          const y = event.nativeEvent.contentOffset.y;
          setShowScrollTop(y > 350);
        }}
        scrollEventThrottle={16}
      >
        {/* Document Meta Info Strip */}
        <View style={styles.metaStrip}>
          <View style={styles.metaItem}>
            <MaterialIcons name="access-time" size={14} color="#64748B" />
            <Text style={styles.metaText}>Updated: {currentDoc.lastUpdated}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <MaterialIcons name="check-circle-outline" size={14} color="#10B981" />
            <Text style={[styles.metaText, { color: '#047857' }]}>{currentDoc.version}</Text>
          </View>
          <View style={styles.metaDot} />
          <TouchableOpacity onPress={handleOpenWebsite} style={styles.metaItem}>
            <MaterialIcons name="open-in-new" size={14} color="#0088E8" />
            <Text style={[styles.metaText, { color: '#0088E8' }]}>{currentDoc.domain}</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Metric Badges */}
        <View style={styles.trustBadgesRow}>
          {currentDoc.trustBadges.map((badge, idx) => (
            <View key={idx} style={styles.trustBadgeCard}>
              <View style={styles.trustBadgeIconBox}>
                <MaterialIcons name={badge.icon} size={20} color="#0088E8" />
              </View>
              <Text style={styles.trustBadgeLabel}>{badge.label}</Text>
              <Text style={styles.trustBadgeDesc}>{badge.desc}</Text>
            </View>
          ))}
        </View>

        {/* Hero Notice Card / Introductory Agreement */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <View style={styles.noticeIconCircle}>
              <MaterialIcons name="format-quote" size={20} color="#001F5B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Agreement Notice</Text>
              <Text style={styles.noticeSubtitle}>Legal acceptance required for platform usage</Text>
            </View>
          </View>
          <Text style={styles.noticeText}>{currentDoc.heroNotice}</Text>
          <TouchableOpacity onPress={handleOpenWebsite} style={styles.noticeLinkBtn} activeOpacity={0.8}>
            <MaterialIcons name="language" size={16} color="#0088E8" />
            <Text style={styles.noticeLinkText}>Visit {currentDoc.domain}</Text>
            <MaterialIcons name="arrow-forward" size={14} color="#0088E8" />
          </TouchableOpacity>
        </View>

        {/* Tag Category Filter Chips */}
        <View style={styles.tagSection}>
          <Text style={styles.filterLabel}>FILTER BY TOPIC</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {tags.map((tag, idx) => {
              const isSelected = selectedTag === tag;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.tagPill, isSelected && styles.tagPillActive]}
                  onPress={() => setSelectedTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Count Indicator */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing <Text style={styles.countNumber}>{filteredSections.length}</Text> of{' '}
            {currentDoc.sections.length} clauses
          </Text>
          {(selectedTag !== 'All' || searchQuery.length > 0) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedTag('All');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetFilterText}>Reset filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Clause Cards List */}
        {filteredSections.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No clauses match your search</Text>
            <Text style={styles.emptyStateDesc}>
              Try searching with different keywords or reset your topic filters.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedTag('All');
              }}
            >
              <Text style={styles.emptyResetText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredSections.map(section => {
            const isExpanded = expandedSections[section.id] !== false; // expanded by default
            return (
              <SectionCard
                key={section.id}
                section={section}
                isExpanded={isExpanded}
                onToggle={() => toggleSection(section.id)}
              />
            );
          })
        )}

        {/* Support & Assistance Card */}
        <View style={styles.supportCard}>
          <LinearGradient
            colors={['#001F5B', '#0047BA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.supportCardInner}
          >
            <View style={styles.supportHeaderRow}>
              <View style={styles.supportIconBox}>
                <MaterialIcons name="headset-mic" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.supportTitle}>Questions About Our Policies?</Text>
                <Text style={styles.supportSubtitle}>
                  Our compliance & legal desk is ready to answer your inquiries.
                </Text>
              </View>
            </View>

            <View style={styles.supportDetailsGrid}>
              <TouchableOpacity
                onPress={() => Linking.openURL('mailto:rajkotmonexis@gmail.com')}
                style={styles.supportItem}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="email-outline" size={18} color="#38BDF8" />
                <Text style={styles.supportItemText}>rajkotmonexis@gmail.com</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('tel:+919104244451')}
                style={styles.supportItem}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="phone-outline" size={18} color="#38BDF8" />
                <Text style={styles.supportItemText}>+91 (910) 4244 451</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.contactSupportBtn}
              onPress={() => navigation.navigate('ContactUs')}
              activeOpacity={0.85}
            >
              <Text style={styles.contactSupportText}>Open Support Centre</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#001F5B" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Legal Disclaimer Footer */}
        <View style={styles.footerLegal}>
          <MaterialIcons name="gavel" size={20} color="#94A3B8" />
          <Text style={styles.footerLegalText}>
            © 2026 MONEXIS.STORE. All rights reserved. Registered under applicable Indian commercial
            and IT regulations.
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollTopButton}
          onPress={scrollToTop}
          activeOpacity={0.85}
        >
          <MaterialIcons name="keyboard-arrow-up" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
// Sub-component: Section Card
// ─────────────────────────────────────────────────────────────
interface SectionCardProps {
  section: LegalSection;
  isExpanded: boolean;
  onToggle: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ section, isExpanded, onToggle }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row of the Card */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.numberBadgeBox}>
          <Text style={styles.numberBadgeText}>{section.number}</Text>
        </View>

        <View style={styles.cardTitleContainer}>
          <View style={styles.cardTagRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>{section.tag}</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardSummary}>{section.summary}</Text>
        </View>

        <View style={styles.toggleIconBox}>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.cardDivider} />

          {/* Paragraphs */}
          {section.paragraphs.map((para, index) => (
            <Text key={index} style={styles.paragraphText}>
              {para}
            </Text>
          ))}

          {/* Numbered Sub-points */}
          {section.numberedList && section.numberedList.length > 0 && (
            <View style={styles.subListContainer}>
              {section.numberedList.map((item, idx) => (
                <View key={idx} style={styles.numberedItemRow}>
                  <View style={styles.numberedCircle}>
                    <Text style={styles.numberedCircleText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.numberedItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bulleted Points */}
          {section.bullets && section.bullets.length > 0 && (
            <View style={styles.bulletContainer}>
              {section.bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletItemRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletItemText}>{bullet}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Highlight Key Takeaway Callout */}
          {section.highlight && (
            <View style={styles.highlightBox}>
              <MaterialIcons name="lightbulb-outline" size={18} color="#0088E8" style={styles.highlightIcon} />
              <Text style={styles.highlightText}>
                <Text style={styles.highlightBold}>Key Clause: </Text>
                {section.highlight}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Stylesheet
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#001F5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: Poppins.bold,
    color: '#38BDF8',
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  headerMainTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  tabsScrollView: {
    marginBottom: 16,
  },
  tabsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: Poppins.medium,
    color: 'rgba(255, 255, 255, 0.75)',
    marginLeft: 6,
  },
  segmentTextActive: {
    color: '#001F5B',
    fontFamily: Poppins.bold,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  countBadgeActive: {
    backgroundColor: '#EEF2FF',
  },
  countBadgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: Poppins.bold,
  },
  countBadgeTextActive: {
    color: '#001F5B',
  },
  countBadgeTextInactive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Poppins.regular,
    color: '#1E293B',
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontFamily: Poppins.medium,
    color: '#64748B',
    marginLeft: 4,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  trustBadgeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  trustBadgeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E5F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  trustBadgeLabel: {
    fontSize: 11,
    fontFamily: Poppins.bold,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 2,
  },
  trustBadgeDesc: {
    fontSize: 9,
    fontFamily: Poppins.regular,
    color: '#64748B',
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#001F5B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noticeTitle: {
    fontSize: 15,
    fontFamily: Poppins.bold,
    color: '#001F5B',
  },
  noticeSubtitle: {
    fontSize: 11,
    fontFamily: Poppins.regular,
    color: '#64748B',
  },
  noticeText: {
    fontSize: 13,
    fontFamily: Poppins.regular,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  noticeLinkText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: '#0088E8',
  },
  tagSection: {
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 11,
    fontFamily: Poppins.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  tagsContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagPillActive: {
    backgroundColor: '#001F5B',
    borderColor: '#001F5B',
  },
  tagText: {
    fontSize: 12,
    fontFamily: Poppins.medium,
    color: '#64748B',
  },
  tagTextActive: {
    color: '#FFFFFF',
    fontFamily: Poppins.bold,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
  },
  countNumber: {
    fontFamily: Poppins.bold,
    color: '#001F5B',
  },
  resetFilterText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: '#0088E8',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  numberBadgeBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#001F5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  numberBadgeText: {
    fontSize: 13,
    fontFamily: Poppins.bold,
    color: '#FFFFFF',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTagRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tagBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 10,
    fontFamily: Poppins.bold,
    color: '#001F5B',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: Poppins.bold,
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardSummary: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
    lineHeight: 16,
  },
  toggleIconBox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  paragraphText: {
    fontSize: 13,
    fontFamily: Poppins.regular,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 10,
  },
  subListContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    gap: 10,
  },
  numberedItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numberedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  numberedCircleText: {
    fontSize: 11,
    fontFamily: Poppins.bold,
    color: '#334155',
  },
  numberedItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Poppins.regular,
    color: '#334155',
    lineHeight: 20,
  },
  bulletContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    gap: 8,
  },
  bulletItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0088E8',
    marginRight: 10,
  },
  bulletItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Poppins.regular,
    color: '#334155',
    lineHeight: 18,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E5F4FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0088E8',
  },
  highlightIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  highlightText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#003D9E',
    lineHeight: 18,
  },
  highlightBold: {
    fontFamily: Poppins.bold,
    color: '#001F5B',
  },
  supportCard: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#001F5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  supportCardInner: {
    padding: 22,
  },
  supportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  supportDetailsGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportItemText: {
    fontSize: 13,
    fontFamily: Poppins.medium,
    color: '#FFFFFF',
  },
  contactSupportBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  contactSupportText: {
    fontSize: 14,
    fontFamily: Poppins.bold,
    color: '#001F5B',
  },
  footerLegal: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  footerLegalText: {
    fontSize: 11,
    fontFamily: Poppins.regular,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  scrollTopButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#001F5B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateDesc: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyResetBtn: {
    backgroundColor: '#001F5B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyResetText: {
    fontSize: 13,
    fontFamily: Poppins.bold,
    color: '#FFFFFF',
  },
});

export default LegalDocumentScreen;
