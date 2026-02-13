import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, FileText, MapPin, Calendar, ChevronRight, RefreshCw, X, Languages } from 'lucide-react';

export default function VendorNotificationHub() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [vendorLocation, setVendorLocation] = useState('Mumbai');
  const [vendorType, setVendorType] = useState('Food Vendor');
  const [language, setLanguage] = useState('english'); // 'english' or 'hindi'
  const [translating, setTranslating] = useState(false);

  // UI Labels in both languages
  const labels = {
    english: {
      title: 'Street Vendor Notification Hub',
      subtitle: 'Government Policies & Important Updates',
      refresh: 'Refresh',
      location: 'Location',
      vendorType: 'Vendor Type',
      errorTitle: 'Error Loading Notifications',
      loading: 'Loading notifications...',
      viewDetails: 'View Full Details',
      deadline: 'Deadline',
      datePublished: 'Date Published',
      fullDetails: 'Full Details',
      actionRequired: 'Action Required',
      close: 'Close',
      priority: 'Priority',
      ongoing: 'Ongoing - No specific deadline',
      note: 'Note:',
      noteText: 'This is a demo component. To use with real data, replace \'YOUR_API_KEY\' in the code with your actual Google Gemini API key from',
      noteLink: 'Google AI Studio',
      noteText2: '. The component will then fetch live, AI-generated notifications relevant to street vendors.'
    },
    hindi: {
      title: 'स्ट्रीट वेंडर सूचना केंद्र',
      subtitle: 'सरकारी नीतियां और महत्वपूर्ण अपडेट',
      refresh: 'रीफ्रेश करें',
      location: 'स्थान',
      vendorType: 'विक्रेता प्रकार',
      errorTitle: 'सूचनाएं लोड करने में त्रुटि',
      loading: 'सूचनाएं लोड हो रही हैं...',
      viewDetails: 'पूरा विवरण देखें',
      deadline: 'समय सीमा',
      datePublished: 'प्रकाशित तिथि',
      fullDetails: 'पूरा विवरण',
      actionRequired: 'आवश्यक कार्रवाई',
      close: 'बंद करें',
      priority: 'प्राथमिकता',
      ongoing: 'जारी - कोई विशिष्ट समय सीमा नहीं',
      note: 'नोट:',
      noteText: 'यह एक डेमो कंपोनेंट है। वास्तविक डेटा के साथ उपयोग करने के लिए, कोड में \'YOUR_API_KEY\' को अपनी वास्तविक Google Gemini API key से बदलें',
      noteLink: 'Google AI Studio',
      noteText2: '। इसके बाद कंपोनेंट स्ट्रीट वेंडरों के लिए प्रासंगिक लाइव, AI-जनित सूचनाएं प्राप्त करेगा।'
    }
  };

  const currentLabels = labels[language];

  const translateNotifications = async (notificationsToTranslate) => {
    if (language === 'english') return notificationsToTranslate;
    
    setTranslating(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate the following notifications from English to Hindi. Maintain the JSON structure exactly. Translate all text fields (title, summary, content, actionRequired, deadline if not a date) but keep field names, category names, priority levels, and dates in English.

${JSON.stringify(notificationsToTranslate, null, 2)}

Return ONLY valid JSON array with translated content, no markdown or extra text.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          }
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        let jsonText = data.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const translated = JSON.parse(jsonText);
        return translated;
      }
      return notificationsToTranslate;
    } catch (err) {
      console.error('Translation error:', err);
      return notificationsToTranslate;
    } finally {
      setTranslating(false);
    }
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'english' ? 'hindi' : 'english';
    setLanguage(newLanguage);
    
    if (newLanguage === 'hindi' && notifications.length > 0) {
      const translated = await translateNotifications(notifications);
      setNotifications(translated);
    } else if (newLanguage === 'english' && notifications.length > 0) {
      // Re-fetch in English
      fetchNotifications();
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 5 important government notifications and policies for street vendors in ${vendorLocation}, India. Focus on ${vendorType} category. 
              
              For each notification, provide:
              1. Title (brief, clear)
              2. Category (one of: Policy Update, License Requirement, Zone Restriction, Financial Scheme, Health & Safety)
              3. Priority (High, Medium, Low)
              4. Date (realistic recent date)
              5. Summary (2-3 sentences)
              6. Detailed content (4-5 sentences with actionable information)
              7. Action required (what vendor needs to do)
              8. Deadline (if applicable)
              
              Format as JSON array with this structure:
              [
                {
                  "id": "unique-id",
                  "title": "...",
                  "category": "...",
                  "priority": "...",
                  "date": "...",
                  "summary": "...",
                  "content": "...",
                  "actionRequired": "...",
                  "deadline": "..."
                }
              ]
              
              Make it realistic and relevant to current Indian street vendor regulations. Return ONLY valid JSON, no markdown or extra text.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        let jsonText = data.candidates[0].content.parts[0].text;
        
        // Clean up the response to extract JSON
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const parsedNotifications = JSON.parse(jsonText);
        setNotifications(parsedNotifications);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err) {
      setError('Failed to fetch notifications. Please check your API key and try again.');
      console.error('Error:', err);
      
      // Fallback demo data
      setNotifications([
        {
          id: '1',
          title: 'New Vending Zone Designation - Central Market Area',
          category: 'Zone Restriction',
          priority: 'High',
          date: '2026-02-10',
          summary: 'Municipal Corporation has designated new legal vending zones in the central market area. All vendors must register for zone allocation.',
          content: 'The Municipal Corporation of Mumbai has identified and marked new Town Vending Zones as per the Street Vendors Act 2014. Vendors operating in unauthorized areas must apply for relocation to designated zones. The new zones offer improved infrastructure including waste disposal, water supply, and electricity connections. Priority will be given to vendors with existing certificates.',
          actionRequired: 'Submit zone allocation application at nearest ward office',
          deadline: '2026-02-28'
        },
        {
          id: '2',
          title: 'PM SVANidhi Scheme - Credit Limit Increased',
          category: 'Financial Scheme',
          priority: 'Medium',
          date: '2026-02-08',
          summary: 'Credit limit under PM SVANidhi scheme increased to ₹50,000 with reduced interest rates for timely repayment.',
          content: 'The Government of India has enhanced the PM Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi) scheme. Eligible vendors can now access loans up to ₹50,000 in three tranches. Interest subsidy of 7% per annum will be credited to eligible vendors\' accounts on timely/early repayment. Digital transactions are encouraged with cashback incentives.',
          actionRequired: 'Apply online through PM SVANidhi portal or nearest CSC',
          deadline: 'Ongoing'
        },
        {
          id: '3',
          title: 'Mandatory Food Safety Training for Food Vendors',
          category: 'Health & Safety',
          priority: 'High',
          date: '2026-02-05',
          summary: 'All food vendors must complete FSSAI-approved food safety training by March 31, 2026.',
          content: 'The Food Safety and Standards Authority of India (FSSAI) has made it mandatory for all food vendors to undergo basic food safety training. Free training sessions are being conducted at designated centers. Certificate of training must be displayed at vending location. Vendors without certification may face penalties.',
          actionRequired: 'Register for free training at FSSAI portal or nearest training center',
          deadline: '2026-03-31'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Policy Update': return <FileText className="w-5 h-5" />;
      case 'Zone Restriction': return <MapPin className="w-5 h-5" />;
      case 'Financial Scheme': return <Calendar className="w-5 h-5" />;
      case 'Health & Safety': return <AlertCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {currentLabels.title}
                </h1>
                <p className="text-gray-600 text-sm">{currentLabels.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                disabled={translating}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Languages className={`w-4 h-4 ${translating ? 'animate-pulse' : ''}`} />
                <span>{language === 'english' ? 'हिंदी' : 'English'}</span>
              </button>
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{currentLabels.refresh}</span>
              </button>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">{currentLabels.location}</label>
              <select
                value={vendorLocation}
                onChange={(e) => setVendorLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
                <option>Chennai</option>
                <option>Kolkata</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">{currentLabels.vendorType}</label>
              <select
                value={vendorType}
                onChange={(e) => setVendorType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Food Vendor</option>
                <option>Fruit & Vegetable Vendor</option>
                <option>Clothing Vendor</option>
                <option>General Merchandise</option>
                <option>Tea/Coffee Stall</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">{currentLabels.errorTitle}</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">{currentLabels.loading}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        {getCategoryIcon(notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority} {currentLabels.priority}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {notification.category}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {new Date(notification.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{notification.summary}</p>

                  <button
                    onClick={() => setSelectedNotification(notification)}
                    className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    {currentLabels.viewDetails}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {notification.deadline && notification.deadline !== 'Ongoing' && (
                  <div className="bg-orange-50 border-t border-orange-200 px-6 py-3">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {currentLabels.deadline}: {new Date(notification.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    {getCategoryIcon(selectedNotification.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedNotification.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedNotification.priority)}`}>
                        {selectedNotification.priority} {currentLabels.priority}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {selectedNotification.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{currentLabels.datePublished}</h3>
                  <p className="text-gray-900">
                    {new Date(selectedNotification.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{currentLabels.fullDetails}</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedNotification.content}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 uppercase mb-2">{currentLabels.actionRequired}</h3>
                  <p className="text-blue-800">{selectedNotification.actionRequired}</p>
                </div>

                {selectedNotification.deadline && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-orange-900 uppercase mb-2">{currentLabels.deadline}</h3>
                    <p className="text-orange-800 font-semibold">
                      {selectedNotification.deadline === 'Ongoing' 
                        ? currentLabels.ongoing
                        : new Date(selectedNotification.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedNotification(null)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {currentLabels.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>{currentLabels.note}</strong> {currentLabels.noteText}{' '}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              {currentLabels.noteLink}
            </a>
            {currentLabels.noteText2}
          </p>
        </div>
      </div>
    </div>
  );
}