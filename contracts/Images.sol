//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)

pragma solidity ^0.8.12;

import "./Base64.sol";
import "./Trigonometry.sol";
import "./Strings.sol";

library Images {
  using Strings for uint256;

  function getToWMetadata() internal pure returns(string memory) {
    return b64(abi.encodePacked(
      '{"name":"The Tree","description":"The Tree will spread wealth to whoever may have ever owned it."',
      ',"image":"', getSVG(getToWSVG()),
      '","attributes":[',
      getTrait(0, "Infinity"), ",",
      getTrait(1, "All"), ",",
      getTrait(2, "All"), "]}"
    ));
  }

  function getHostTokenMetadata(uint tokenId) internal pure returns(string memory){
    string memory color1;
    string memory color2;
    string memory wealth;
    (color1, color2, wealth) = getColors(tokenId);

    return b64(abi.encodePacked(
      '{"name":"Host token #', tokenId.toString(),
      '","description":"Honor to the ', tokenId.toString(), getOrdinal(tokenId), ' host of The Tree of Wealth"',
      ',"image":"', getSVG(getHostSVG(tokenId, color1, color2)),
      '", "attributes":[',
      getTrait(0, wealth ), ",",
      getTrait(1, color1), ",",
      getTrait(2, color2), ']}'
    ));
  }

  function b64(bytes memory meta) private pure returns(string memory) {
    return string.concat(
      "data:application/json;base64,",
      Base64.encode(meta)
    );
  }

  function getTrait(uint t, string memory v) private pure returns(string memory){
    string memory tt = t == 0 ?
      'Wealth' : (t == 1 ? 'Primary Color' : 'Secondary Color')
    ;

    return string.concat(
      '{"trait_type":"', tt,
      '","value":"', v,
      '"}'
    );
  }

  function getSVG( bytes memory content ) private pure returns(string memory){
    return string.concat(
      "data:image/svg+xml;base64,",
      Base64.encode(content)
    );
  }

  function getToWSVG() private pure returns(bytes memory){
    return abi.encodePacked(
      openDefsSVG(),
      getCoinSVG("#fd6", "#db5"),
      getCoinsSVG(),
      getHalfTree(),
      getGradientSVG(),
      getTreeSVG('url(#c)'),
      getWaveSVG(),
      closeDefsSVG(),
      "<path fill='#412' d='M0 0h1000v698H0z'/><use xlink:href='#e' fill='#825' transform='rotate(-2 27339 -14967.1) scale(7)'/><use xlink:href='#e' fill='#938' transform='rotate(-10 4026 -2573.2) scale(4)'/><use xlink:href='#e' fill='#d8b' transform='rotate(10 -3082.2 3145.6) scale(2.2)'/><circle fill='#023' cx='500' cy='1365' r='714'/><use xlink:href='#f'/></svg>"
    );
  }

  function getHostSVG( uint tokenId, string memory color1, string memory color2 ) private pure returns(bytes memory) {
    return abi.encodePacked(
        // We need to call 2 nested encodePacked in order to avoid
        // the Stack too deep error
        string(abi.encodePacked(
            openDefsSVG(),
            getCoinSVG(color1, color2),
            getCoinsSVG(),
            getHalfTree(),
            getTreeSVG(color1),
            getNumberDefinitions(tokenId),
            closeDefsSVG()
        )),
        string(abi.encodePacked(
            "<circle cx='500' cy='500' r='500' fill='", color1, "'/>", // external circle
            "<circle cx='500' cy='500' r='370' fill='", color2, "'/>", // private circle
            "<use xlink:href='#f' transform='matrix(.68 0 0 .68 160.5 183)'/>", // tree
            "<g fill='", color2, "' transform='translate(476 32)'><path d='m-79 82-6-30 28-6 6 31 11-3-15-69-11 2 6 30-27 6-6-30-11 2 15 70z'/><use xlink:href='#0' transform='scale(1.3 1) rotate(-3 -11.5 440.6)'/><path d='M64 73c31 4 37-36 7-41-26-3-20-22-6-20 7 0 12 2 18 6l6-9a40 40 0 0 0-23-8c-34 0-31 38-2 41 22 2 21 21 0 21a31 31 0 0 1-20-8l-7 8a46 46 0 0 0 27 10Zm60 10 13-60 19 5 3-10-49-11-2 9 19 5-14 60z'/></g>", // HOST
            getHostNumberSVG(tokenId, color2),
            "</svg>"
        ))
    );
  }

  // #f
  function getTreeSVG(string memory treeColor ) private pure returns(string memory){
    return string.concat(
      "<g id='f'><use xlink:href='#b' fill='",
      treeColor,
      "'/><use xlink:href='#b' fill='",
      treeColor,
      "' transform='matrix(-1 0 0 1 992 0)'/><use xlink:href='#d' transform='matrix(-1 0 0 1 1021 -25)'/><use xlink:href='#d' transform='translate(-25 -25)'/></g>"
    );
  }

  // #b
  function getHalfTree() private pure returns(string memory){
    return "<path d='M424 219c32 29 61 70 74 134v306c-15 0-41 9-45 17-46 84-62 161-62 264 0 19 1 41 3 60H275c5-130 47-239 130-328 8-9-15-9-28-7a786 786 0 0 0-34 7 518 518 0 0 0-219 328H3a519 519 0 0 1 246-300C157 735 64 798-6 865v-11l2-2a732 732 0 0 1 345-212c29-8 49-59 49-90 0-53-20-103-93-103-72 0-129 103-77 148-88-32-15-167 85-167 62 0 98 19 116 49v-1c3-16 3-33 3-39-1-44-27-88-84-93s-146 13-192 94c27-99 133-128 192-125 54 2 108 37 125 92-4-72-34-135-59-164-29-33-106-54-181 7 21-56 133-90 199-29Z' id='b'/>";
  }

  // #c
  function getGradientSVG() private pure returns(string memory) {
    return "<radialGradient cx='50%' cy='26.4%' fx='50%' fy='26.4%' r='83.3%' gradientTransform='matrix(-.20706 .96593 -1.08184 -.36235 .9 -.1)' id='c'><stop stop-color='#FFF' offset='0%'/><stop stop-color='#FFF' offset='60%'/><stop stop-color='#023' offset='100%'/></radialGradient>";
  }

  // #a
  function getCoinSVG( string memory color1, string memory color2 ) private pure returns(string memory) {
    return string.concat(
      "<g id='a'><circle fill='",
      color1,
      "' cx='25' cy='25' r='25'/><circle fill='",
      color2,
      "' cx='25' cy='25' r='19'/><path d='m30 36-5-5-4 5c-2 2-8-5-7-6l5-5-5-4c-1-2 5-8 7-7l4 5 5-5c1-1 8 5 6 7l-5 4 5 5c2 1-5 8-6 6Z' fill='",
      color1, 
      "'/></g>"
    );
  }

  // #d
  function getCoinsSVG() private pure returns(string memory) {
    return "<g id='d'><use xlink:href='#a' transform='translate(498 279)'/><use xlink:href='#a' transform='translate(528 227)'/><use xlink:href='#a' transform='translate(572 186)'/><use xlink:href='#a' transform='translate(629 163)'/><use xlink:href='#a' transform='translate(688 164)'/><use xlink:href='#a' transform='translate(749 186)'/><use xlink:href='#a' transform='translate(683 235)'/><use xlink:href='#a' transform='translate(623 246)'/><use xlink:href='#a' transform='translate(742 257)'/><use xlink:href='#a' transform='translate(585 296)'/><use xlink:href='#a' transform='translate(649 370)'/><use xlink:href='#a' transform='translate(714 373)'/><use xlink:href='#a' transform='translate(774 397)'/><use xlink:href='#a' transform='translate(844 374)'/><use xlink:href='#a' transform='translate(786 321)'/><use xlink:href='#a' transform='translate(823 447)'/><use xlink:href='#a' transform='translate(694 472)'/><use xlink:href='#a' transform='translate(750 499)'/><use xlink:href='#a' transform='translate(771 553)'/><use xlink:href='#a' transform='translate(838 524)'/></g>";
  }

  // #e
  function getWaveSVG() private pure returns(string memory)  {
    return "<path id='e' d='M0 150c57 0 52-30 86-65 35-34 64-33 64-85s-30-52-64-86c-34-33-32-64-86-64s-52 31-86 64c-33 34-64 27-64 86s31 52 64 86c34 34 29 64 86 64Z'/>";
  }

  function openDefsSVG() private pure returns(string memory){
    return "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='1000' height='1000'><defs>";
  }
  function closeDefsSVG() private pure returns(string memory){
    return "</defs>";
  }

  function getOrdinal( uint n ) private pure returns(string memory){
    if( n % 10 == 1 && n != 11 ) return 'st';
    if( n % 10 == 2 && n != 12 ) return 'nd';
    if( n % 10 == 3 && n != 13 ) return 'rd';
    return 'th';
  }

  function getColors( uint n ) private pure returns(string memory, string memory, string memory) {
    uint h = n*41 % 360;
    uint s = (n*n+69) % 100;
    uint l = n*61 % 100;
    
    uint factor = ((n+150) * 3 % 100);
    uint diff = l < 50 ? 
      (100 - (l + 50)) * factor / 100 : 
      (l - 50) * factor / 100
    ;

    uint altL = l < 50 ?
      l + 50 + diff :
      l - 50 - diff
    ;

    return (
      getColorCode( h, s, l ),
      getColorCode( h, s, altL),
      diff.toString()
    );
  }

  function getColorCode( uint h, uint s, uint l ) private pure returns (string memory) {
    return string.concat(
      'hsl(', h.toString(), ",", s.toString(), '%,', l.toString(), '%)'
    );
  }

  function getNumberDefinitions( uint n ) private pure returns (string memory) {
    bytes memory b = bytes(n.toString());

    // 0 is always defined as the O from HOST
    string memory definitions = getNumberSVG(0);
    uint isDefined = 0;

    for(uint i; i < b.length; i++){
      uint digit = uint(uint8(b[i])) - 48;
      if( digit != 0 ){
        // 9 image will just be 6 upside down
        uint position = digit == 9 ? 6 : digit;
        bool alreadyDefined = ((isDefined >> position) & 1) == 1;
        if( !alreadyDefined ){
          definitions = string.concat( definitions, getNumberSVG(position));
          isDefined = isDefined | uint(1) << position;
        }
      }
    }
  
    return definitions;
  }

  function getNumberSVG(uint n) private pure returns (string memory) {
    if( n == 0 ){
      return "<path id='0' d='M20 72c17 0 20-14 20-20V21c0-7-3-21-20-21S0 14 0 21v31c0 6 3 21 20 20Z'/>";
    }
    if( n == 1 ){
      return "<path id='1' d='M20 71V0H0l10 11v60z'/>";
    }
    if( n == 2 ){
      return "<path id='2' d='M41 70V60H14l23-28C58-2 0-13 0 19h10c0-17 32-8 18 7C8 48-2 63 0 70h41Z'/>";
    }
    if( n == 3 ){
      return "<path id='3' d='M33 34C58-5 0-10 0 18h11c-1-16 39-8 5 16 34 14 2 40-6 19H0c1 30 62 19 33-19Z'/>";
    }
    if( n == 4 ){
      return "<path id='4' d='M40 71V46l-29 5L35 0H24L0 51v10h30v10z'/>";
    }
    if( n == 5 ){
      return "<path id='5' d='M41 47c0-3 2-32-30-21V10h28V0H1v40c20-11 30-9 29 6 0 23-20 17-20 7H0c0 25 41 27 41-6Z'/>";
    }
    if( n == 6 ){
      return "<path id='6' d='M33 0H21L5 33l-1 3-1 1c-3 8-6 18 1 27 3 6 17 13 30 2 10-8 8-24 5-29-8-11-20-8-21-7v-1L33 0Z'/>";
    }
    if( n == 7 ){
      return "<path id='7' d='M16 71 45 0H0l10 10h19L5 71z'/>";
    }
    if( n == 8 ){
      return "<path id='8' d='M21 72c22 0 27-27 13-37 8-6 10-35-13-35C-3 0-1 29 7 35-6 45-2 72 21 72Z'/>";
    }
    
    return string.concat("<g id='error", n.toString(), "'/>" );
  }

  function getDigit(bytes1 b) private pure returns(uint) {
    return uint(uint8(b)) - 48;
  }

  function getHostNumberSVG(uint n, string memory color) private pure returns(string memory) {
    bytes memory b = bytes(n.toString());

    uint angle = 0;
    //int r = 424; // We are going to replace this to save one var

    // We always need the # symbol
    string memory output = "<path d='m14 71 3-22h10l-3 22h7l4-22h10v-6H35l2-15h10v-6h-9l3-22h-8l-3 22h-9l3-22h-8l-3 22H3v6h9l-2 15H0v6h9L6 71z'/>";

    for(uint i; i < b.length; i++){
      // uint digit = uint(uint8(b[i])) - 48;
     
      if( i > 0 && getDigit(b[i-1]) == 1 ){
        angle += Trigonometry.PI / 32;
      }
      else {
        angle += Trigonometry.PI / 25;
      }

      string memory translateX = uint( 424 * Trigonometry.sin(angle) / 1 ether).toString();
      int y = ((424 * Trigonometry.cos(angle)) - (424 * 1 ether)) / 1 ether;

      string memory translateY = y < 0 ? 
        string.concat( "-", uint(y * -1).toString() ) :
        uint(y).toString()
      ;
      if( getDigit(b[i]) == 9 ){
        output = string.concat(
          output,
          "<use xlink:href='#6' transform='translate(",
            translateX, " ",
            translateY, ") rotate(-", toDegrees( angle + Trigonometry.PI ), 
            ") translate(-40 -70)'/>"
        );
      }
      else {
        output = string.concat(
          output, 
          "<use xlink:href='#", getDigit(b[i]).toString(), 
          "' transform='translate(", translateX, " ", translateY,
          ") rotate(-", toDegrees(angle), ")'/>"
        );
      }
    }

    return string.concat(
      getNumberGroupSVG(angle, color),
      output,
      "</g>"
    );
  }

  function getNumberGroupSVG(uint angle, string memory color) private pure returns (string memory) {
    uint idAngle = (angle + (Trigonometry.PI/32)) / 2;
    //int r = 424; // We are going to replace this to save one var

    uint x = uint( (500 * 1 ether) - Trigonometry.sin(idAngle) * 424);
    uint y = uint( (476 * 1 ether) + Trigonometry.cos(idAngle) * 424);

    return string.concat(
      "<g fill='", color, "' transform='translate(",
        ( x / 1 ether ).toString(), ",",
        ( y / 1 ether ).toString(), ") rotate(",
        toDegrees(idAngle), ")'>"
    );
  }

  function toDegrees(uint angle) private pure returns ( string memory ) {
    return (angle * 180 / Trigonometry.PI).toString();
  }
}
