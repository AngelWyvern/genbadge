# ![genbadge](docs/resources/logo.svg)

`genbadge` is a simple HTTP-based SVG badge generator written in TypeScript. This is just a small side-project of mine that I made mostly for fun and therefore won't be getting much support.

## Building and running genbadge 

To install dependencies:

```bash
bun install
```

To run:

```bash
bun .
```

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Sample usage

Upon running `genbadge`, you can start generating badges by accessing the HTTP server (by default, will be available at http://127.0.0.1:3000/) and querying with your desired parameters.

Example: http://127.0.0.1:3000/?shape=insetpill&bg=2d3138&fg=fff&accent=ffc800&icon=shield&label=genbadge&align=center&w=160&h=32

# Reference

The following is a list of valid parameters along with their value types or possible value choices:

|Parameter|Value Type      |Description                                            |
|---------|----------------|-------------------------------------------------------|
|`shape`  |Enum (see below)|The desired shape of the badge                         |
|`w`      |Float           |The desired width of the badge                         |
|`h`      |Float           |The desired height of the badge                        |
|`bg`     |Color           |The desired background color of the badge              |
|`fg`     |Color           |The desired foreground color of the badge              |
|`accent` |Color           |The desired accent (icon background) color of the badge|
|`icon`   |Enum (see below)|The desired glyph on the badge                         |
|`label`  |String          |The desired text on the badge                          |
|`align`  |Enum (see below)|The desired text alignment on the badge                |

## Enumerators

### Shape

Possible values (and previews):

> ###### Square
> ![shape_square.svg](docs/resources/shape_square.svg)

> ###### InsetSquare
> ![shape_insetsquare.svg](docs/resources/shape_insetsquare.svg)

> ###### Diamond
> ![shape_diamond.svg](docs/resources/shape_diamond.svg)

> ###### InsetDiamond
> ![shape_insetdiamond.svg](docs/resources/shape_insetdiamond.svg)

> ###### Pill
> ![shape_pill.svg](docs/resources/shape_pill.svg)

> ###### InsetPill
> ![shape_insetpill.svg](docs/resources/shape_insetpill.svg)

### Glyph

Possible values (and previews):

> ##### Info
> ![icon_info.svg](docs/resources/icon_info.svg)
> ###### *Accent color #0080FF recommended*

> ##### Exclamation
> ![icon_exclamation.svg](docs/resources/icon_exclamation.svg)
> ###### *Accent color #FFC800 recommended*

> ##### Cross
> ![icon_cross.svg](docs/resources/icon_cross.svg)
> ###### *Accent color #F00000 recommended*

> ##### Shield
> ![icon_shield.svg](docs/resources/icon_shield.svg)

### TextAlign

Possible values (and previews):

> ##### Left
> ![align_left.svg](docs/resources/align_left.svg)

> ##### Center
> ![align_center.svg](docs/resources/align_center.svg)

> ##### Right
> ![align_right.svg](docs/resources/align_right.svg)
