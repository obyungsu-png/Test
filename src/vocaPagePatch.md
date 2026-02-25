# VocaPage.tsx 다운로드 함수 수정

204-216행을 아래로 교체:

```typescript
  const handleDownloadPDF = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    const selectedDays = getSelectedDays();
    const dayRange = selectedDays.length === 1 
      ? `Day${selectedDays[0]}` 
      : `Day${selectedDays[0]}~Day${selectedDays[selectedDays.length - 1]}`;
    
    downloadHackersVocaPDF(selectedWords, selectedExam, dayRange);
    toast.success("PDF 파일로 다운로드되었습니다!");
  };
```

218-229행을 아래로 교체:

```typescript
  const handleDownloadWord = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    const selectedDays = getSelectedDays();
    const dayRange = selectedDays.length === 1 
      ? `Day${selectedDays[0]}` 
      : `Day${selectedDays[0]}~Day${selectedDays[selectedDays.length - 1]}`;
    
    downloadHackersVocaWord(selectedWords, selectedExam, dayRange);
    toast.success("워드 파일로 다운로드되었습니다!");
  };
```

231-242행을 아래로 교체:

```typescript
  const handleDownloadHWP = () => {
    const selectedWords = getAvailableWords().filter(w => wordSelections[w.id]);
    const selectedDays = getSelectedDays();
    const dayRange = selectedDays.length === 1 
      ? `Day${selectedDays[0]}` 
      : `Day${selectedDays[0]}~Day${selectedDays[selectedDays.length - 1]}`;
    
    downloadHackersVocaHWP(selectedWords, selectedExam, dayRange);
    toast.success("한글 파일로 다운로드되었습니다!");
  };
```
