
export const analyzeCSV = (data: CSVData): CSVStats => {
  const phoneIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('phone') || h.toLowerCase().includes('telefone')
  );
  
  const messageIndex = data.headers.findIndex(h => 
    h.toLowerCase().includes('message') || h.toLowerCase().includes('mensagem') ||
    h.toLowerCase().includes('reply_message_text')
  );
  
  let validPhoneNumbers = 0;
  let emptyMessages = 0;
  let phoneNumbers = new Set<string>();
  let duplicateCount = 0;
  let correctedPhoneNumbers = 0;
  
  if (phoneIndex >= 0) {
    data.rows.forEach(row => {
      const phone = row[phoneIndex].trim();
      
      if (isValidPhoneNumber(phone)) {
        validPhoneNumbers++;
        
        if (phoneNumbers.has(phone)) {
          duplicateCount++;
        } else {
          phoneNumbers.add(phone);
        }
      }
      
      if (messageIndex >= 0) {
        const messageText = row[messageIndex]?.trim() || '';
        if (messageText === '') {
          emptyMessages++;
        }
      }
    });
  }
  
  return {
    totalRecords: data.rows.length,
    validPhoneNumbers,
    duplicatePhoneNumbers: duplicateCount,
    emptyMessages,
    correctedPhoneNumbers
  };
};
