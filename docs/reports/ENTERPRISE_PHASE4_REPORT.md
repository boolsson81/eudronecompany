# Enterprise Phase 4A Report

**Generated:** 2026-06-13T11:30:00.111Z
**Mode:** Read-only — recommendations only

## Summary

| Metric | Value |
|--------|------:|
| Collections specified | 10 |
| Ready to create/update | 9 |
| Deferred (0 products) | 1 |

## Collection validation

| Collection | Handle | Products | Rules | Menu | Validation |
|---|---|--:|---|---|---|
| DJI Matrice 300 RTK | `dji-matrice-300-rtk` | 2 | 3 rules (OR) | enterprise-dr-nare → Matrice 300 RTK | ready_create |
| DJI Matrice 3D | `dji-matrice-3d` | 2 | 3 rules (OR) | enterprise-dr-nare → Matrice 3D | ready_create |
| DJI Matrice 3TD | `dji-matrice-3td` | 1 | 3 rules (OR) | enterprise-dr-nare → Matrice 3TD | ready_create |
| DJI Mavic 3 Thermal | `dji-mavic-3-thermal` | 8 | 3 rules (OR) | enterprise-dr-nare → Mavic 3 Thermal | ready_create |
| DJI Agras T25 | `dji-agras-t25` | 0 | 3 rules (OR) | enterprise-dr-nare → Agras T25 | defer_no_products |
| DJI Agras T40 | `dji-agras-t40` | 2 | 3 rules (OR) | enterprise-dr-nare → Agras T40 | ready_create |
| DJI Agras T50 | `dji-agras-t50` | 3 | 3 rules (OR) | enterprise-dr-nare → Agras T50 | ready_create |
| DJI FlyCart 30 | `dji-flycart-30` | 2 | 3 rules (OR) | enterprise-dr-nare → FlyCart 30 | ready_create |
| DJI Dock 2 | `dji-dock-2` | 1 | 2 rules (OR) | enterprise-dr-nare → Dock 2 | ready_create |
| DJI Dock 3 | `dji-dock-3` | 1 | 2 rules (OR) | enterprise-dr-nare → Dock 3 | ready_create |

## Rule definitions

### DJI Matrice 300 RTK (`dji-matrice-300-rtk`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Matrice 300"
    },
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "M300 RTK"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "Matrice 300 RTK"
    }
  ]
}
```

### DJI Matrice 3D (`dji-matrice-3d`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Matrice 3D"
    },
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "M3D"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "DJI Matrice 3D"
    }
  ]
}
```

### DJI Matrice 3TD (`dji-matrice-3td`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Matrice 3TD"
    },
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "3TD"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "DJI Matrice 3TD"
    }
  ]
}
```

### DJI Mavic 3 Thermal (`dji-mavic-3-thermal`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Mavic 3T"
    },
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Mavic 3 Thermal"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "Mavic 3T"
    }
  ]
}
```

### DJI Agras T25 (`dji-agras-t25`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Agras T25"
    },
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "T25"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "Agras T25"
    }
  ]
}
```

### DJI Agras T40 (`dji-agras-t40`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Agras T40"
    },
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "T40"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "Agras T40"
    }
  ]
}
```

### DJI Agras T50 (`dji-agras-t50`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Agras T50"
    },
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "T50"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "Agras T50"
    }
  ]
}
```

### DJI FlyCart 30 (`dji-flycart-30`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "FlyCart 30"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "FlyCart 30"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "DJI FlyCart 30"
    }
  ]
}
```

### DJI Dock 2 (`dji-dock-2`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Dock 2"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "DJI Dock 2"
    }
  ]
}
```

### DJI Dock 3 (`dji-dock-3`)

```json
{
  "appliedDisjunctively": true,
  "rules": [
    {
      "column": "TITLE",
      "relation": "CONTAINS",
      "condition": "Dock 3"
    },
    {
      "column": "TAG",
      "relation": "EQUALS",
      "condition": "DJI Dock 3"
    }
  ]
}
```


## Deferred collections

- `dji-agras-t25` — 0 projected products

## Deployment note

Create collections + apply ruleSet only. Do not change URLs, handles, or existing SEO.
