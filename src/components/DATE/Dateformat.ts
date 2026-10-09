export const formatDate = (dateInput: any) => {
  if (!dateInput) return 'N/A'; 

  let date = dateInput;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export const today = formatDate(new Date());
