# Test Cases Documentation

## Test File Structure

Generated test files are located in the `test-files/` directory, grouped by functionality:

### Basic Tests

| Directory | Purpose | Test Rules |
|-----------|---------|------------|
| `01-basic-sequence/` | Basic sequence numbers | sequence (numeric/alpha/roman) |
| `02-mixed-extensions/` | Extension grouping | sequence + perExtension scope |
| `03-folders/` | Folder hierarchy | sequence + perFolder scope + hierarchical |
| `04-special-chars/` | Special character handling | removeCleanup, caseStyle |
| `05-chinese/` | Chinese filenames | Compatibility test |
| `06-extract-numbers/` | Number extraction | sequence + preserveOriginal |

### Scenario Tests

| Directory | Simulated Scenario | Recommended Rule Combination |
|-----------|-------------------|------------------------------|
| `07-creator/` | Video creator | ① findReplace: `REC`→`Clip` ② sequence: `{n}_{name}` + perFolder |
| `08-photos/` | Photo organization | ① findReplace: `IMG_`→`` ② sequence: perFolder + sortBy:name |
| `09-project-assets/` | Project assets | caseStyle: kebab-case + sequence |

### Edge Case Tests

| Directory | Test Points |
|-----------|-------------|
| `10-edge-cases/` | Long names, no extension, multiple extensions |
| `11-code-files/` | File category recognition test |

### Demo Files

| Directory | Purpose |
|-----------|---------|
| `99-demo/before/` | Landing Page Before screenshot |
| `99-demo/after/` | Landing Page After screenshot |
| `99-demo/hierarchical/` | Hierarchical numbering demo |

## Recommended Test Flow

```
1. Run ./scripts/generate-test-files.sh
2. Drag test-files directory into the rename tool
3. Test each feature with configurations below
```

## Feature Test Configurations

### 1. Basic Sequence Test
```
Rule 1: sequence
  - seqType: numeric
  - start: 1, step: 1, padding: 3
  - position: start
  - scope: global
```

### 2. Per-Folder Numbering
```
Rule 1: sequence
  - seqType: numeric, padding: 2
  - scope: perFolder
  - hierarchical: false
```

### 3. Hierarchical Numbering Demo
```
Rule 1: sequence
  - seqType: numeric, padding: 1
  - scope: perFolder
  - hierarchical: true
  - hierarchySeparator: "."
```

### 4. Preserve Original Numbers
```
Rule 1: sequence
  - seqType: numeric, padding: 3
  - preserveOriginal: true
  - preservePattern: (\d+)
  - template: Photo_{n}
```

### 5. Chinese Cleanup Test
```
Rule 1: removeCleanup
  - mode: cleanup
  - removeDigits: false
  - removeSymbols: true
  - removeSpaces: true
  - removeChinese: false
  - removeEnglish: false
```

### 6. Case Conversion
```
Rule 1: caseStyle
  - mode: kebab-case
  - style: none
```

### 7. Creator Scenario Full Flow
```
Rule 1: findReplace
  - find: "REC", replace: "Scene"

Rule 2: findReplace
  - find: "AUDIO_", replace: "Audio_"

Rule 3: sequence
  - template: "{folderName}_{n}_{name}"
  - scope: perFolder
  - padding: 2
```

### 8. Date Variable Test
```
Rule 1: insert
  - text: "{date}_"
  - position: start
```

### 9. Regex Test
```
Rule 1: regex
  - pattern: "(\d{4})(\d{2})(\d{2})"
  - replacement: "$1-$2-$3"
  - flags: "g"
Purpose: Convert 20240318 to 2024-03-18
```

### 10. Custom JS Test
```
Rule 1: customJs
  - code:
    function rename(options) {
      const { name, index, size } = options;
      // Classify by file size
      const sizeLabel = size > 1024*1024 ? 'Large' : 'Small';
      return `${sizeLabel}_${String(index+1).padStart(3, '0')}_${name}`;
    }
```

### 11. Extension Scope Test
```
Extension scope: extension (rename extension only)
Rule 1: caseStyle
  - mode: uppercase
Test: file.jpg → file.JPG
```

### 12. Full Filename Scope Test
```
Extension scope: full (rename entire filename including extension)
Rule 1: caseStyle
  - mode: lowercase
Test: MyFile.JPG → myfile.jpg
```

### 13. Sort Before Numbering Test
```
Rule 1: sequence
  - sortBeforeNumbering: true
  - sortBy: size (or modified/extension)
  - sortOrder: desc
  - naturalSort: true
Purpose: Number files after sorting by size descending
```

### 14. Per-Category Grouping Test
```
Rule 1: sequence
  - scope: perCategory
  - template: "{n}_{name}"
Purpose: Images/videos/audio/documents/code numbered independently
```

### 15. Metadata Variable Test (requires image/video files)
```
Rule 1: insert
  - text: "{exif.date}_{exif.camera}_"
  - position: start
Or
Rule 1: insert
  - text: "{media.width}x{media.height}_"
  - position: start
```

### 16. Position Replace Test
```
Rule 1: findReplace
  - usePosition: true
  - fromEnd: false
  - positionStart: 0
  - positionCount: 3
  - replace: "NEW"
Purpose: Replace first 3 characters with NEW
```

### 17. Range Delete Test
```
Rule 1: removeCleanup
  - mode: range
  - rangeStart: 5
  - rangeEnd: 10
Purpose: Delete characters 5-10
```

### 18. Complex Rule Chain Test
```
Rule 1: removeCleanup (cleanup symbols)
  - mode: cleanup
  - removeSymbols: true

Rule 2: caseStyle (to lowercase)
  - mode: lowercase

Rule 3: caseStyle (space to dash)
  - style: spaceToDash

Rule 4: sequence (add sequence number)
  - template: "{n}_{name}"
  - padding: 3

Purpose: IMG_2024@#$.jpg → 001_img_2024.jpg
```

### 19. Natural Sort Comparison Test
```
Files: file1.txt, file10.txt, file2.txt, file20.txt

Rule 1: sequence
  - sortBeforeNumbering: true
  - naturalSort: true
Result: file1→001, file2→002, file10→003, file20→004

Rule 1: sequence
  - sortBeforeNumbering: true
  - naturalSort: false
Result: file1→001, file10→002, file2→003, file20→004
```

### 20. Conflict Detection Test
```
Test files: file1.txt, file2.txt
Rule 1: findReplace
  - find: "file"
  - replace: "doc"
  - matchAll: true
Expected: Both files become doc1.txt and doc2.txt → Conflict detected
```

## Boundary & Exception Tests

### 21. Empty Filename Test
```
Rule 1: removeCleanup
  - mode: cleanup
  - removeDigits: true
  - removeEnglish: true
Test: 123abc.txt → .txt (empty filename, should be marked as error)
```

### 22. Illegal Character Test
```
Rule 1: insert
  - text: "file<>:"/\|?*"
  - position: start
Expected: Should detect illegal characters and mark conflict
```

### 23. Long Filename Test
```
Test: Generate 255+ character filename
Expected: Check if handled correctly
```

### 24. No Extension File Test
```
Test files: README, Makefile, .gitignore
Rule 1: sequence
  - template: "{n}_{name}"
Expected: Correctly handle files without extension
```

### 25. Multiple Extension Test
```
Test files: archive.tar.gz, backup.sql.bz2
Rule 1: sequence
  - template: "{n}_{name}"
Expected: Only recognize last extension
```

### 26. Roman Numeral Boundary Test
```
Rule 1: sequence
  - seqType: roman
  - start: 3999
Expected: Should fallback to numeric when exceeding 3999
```

### 27. Alpha Sequence Test
```
Rule 1: sequence
  - seqType: alpha
  - start: 1, step: 1
Test: Verify A, B, C...Z, AA, AB...
```

### 28. Template Variable Combination Test
```
Rule 1: sequence
  - template: "{date}_{folderName}_{n}_{name}"
Expected: All variables correctly parsed
```

### 29. Relative Path Test
```
Test: Multi-level folder structure
Rule 1: sequence
  - template: "{relativePath}_{n}"
Expected: Correctly display relative path
```

### 30. Time Format Test
```
Rule 1: insert
  - text: "{date:YYYY-MM-DD}_"
  - position: start
Or
  - text: "{date:YYYYMMDD_HHmmss}_"
Expected: Correctly format date/time
```

## Performance Tests

### 31. Large Batch Test
```
Test: 1000+ files
Rules: Multiple rule combination
Expected: Preview generation time < 2 seconds
```

### 32. Deep Nesting Test
```
Test: 10+ level folder nesting
Rule: hierarchical numbering
Expected: Correctly generate hierarchical numbers
```

## User Experience Tests

### 33. Preset Save & Load
```
1. Create complex rule combination
2. Save as preset
3. Clear rules
4. Load preset
Expected: Rules fully restored
```

### 34. Undo/Redo Test
```
1. Apply multiple rules
2. Undo operation
3. Redo operation
Expected: State correctly restored
```

### 35. File Filter Test
```
Filter condition:
  - field: extension
  - operator: equals
  - value: ".jpg"
Expected: Only show jpg files
```

### 36. Multi-Condition Filter Test
```
Condition 1: size > 1MB
Condition 2: name contains "2024"
logic: AND
Expected: Only show files matching both conditions
```

### 37. Regex Filter Test
```
Filter condition:
  - field: name
  - operator: regex
  - value: "^\d{8}"
Expected: Only show files starting with 8 digits
```

## Internationalization Tests

### 38. Multi-Language Filename Test
```
Test files: 
  - Chinese: 我的文档.txt
  - Japanese: ファイル.txt
  - Korean: 파일.txt
  - Arabic: ملف.txt
  - Emoji: 📁文件📄.txt
Rule: sequence + caseStyle
Expected: Correctly handle all characters
```

### 39. Mixed Character Test
```
Test: Hello世界123.txt
Rule 1: removeCleanup
  - removeChinese: true
Expected: Hello123.txt
```

## Integration Test Scenarios

### 40. Photographer Workflow
```
Scenario: Wedding photography (1000+ photos)
Rule 1: insert
  - text: "{exif.date}_Wedding_"
Rule 2: sequence
  - scope: perFolder
  - template: "{folderName}_{n}"
  - sortBy: modified
  - sortBeforeNumbering: true
```

### 41. Video Editor Workflow
```
Scenario: Multi-camera footage organization
Rule 1: findReplace
  - find: "CAM_A"
  - replace: "Camera_01"
Rule 2: sequence
  - template: "S01E01_{n}_{name}"
  - scope: perFolder
  - hierarchical: true
```

### 42. Developer Workflow
```
Scenario: Code file standardization
Rule 1: caseStyle
  - mode: kebab-case
Rule 2: removeCleanup
  - removeSpaces: true
  - removeSymbols: true
Rule 3: sequence
  - scope: perCategory
```

### 43. Music Library Organization
```
Scenario: Music file renaming
Rule 1: insert
  - text: "{media.artist}_"
Rule 2: sequence
  - template: "{n}_{name}"
  - scope: perFolder
```
