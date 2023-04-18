# zkBoys (ZKB)

## TR
Bu kontrat, zkSync Era Mainnet üzerinde ERC721 tabanlı zkBoys adlı NFT koleksiyonu token mintleme ve satış kontratıdır. Koleksiyonun toplam arzı 1000 adettir. Süreç şöyle işlemektedir:
1. Kontrat sahibi, satış süreci başlamadan önce whitelist sahibi adresleri `addToWhitelist` fonksiyonu ile kaydeder.
2. Whitelist satış başlangıç tarihi **Pazartesi, 3 Nisan 2023 14:00:00** tarihidir.
3. Bir wl sahibi adres whitelist satış süresi dahilinde `mintForWhitelist` fonksiyonu ile en fazla 5 adet ücretsiz NFT mintleyebilir.
4. Public satış başlangıç tarihi ve whitelist satış süresi bitiş tarihi **Pazartesi, 3 Nisan 2023 20:00:00** tarihidir.
5. Whitelist satış süresi bittikten sonra public satış başlar.
6. Public satışta her NFT 0.0015 ether karşılığı mint edilir.
7. Bir adres public satışta `mintForPublic` fonksiyonu ile en fazla 20 adet NFT mintleyebilir.
8. Kontrat sahibi, kontrat bakiyesini istediği zaman `withdraw` fonksiyonu ile çekebilir.

## EN
This contract is an ERC721-based NFT collection token minting and selling contract named zkBoys on the zkSync Era Mainnet. The total supply of the collection is 1000 pieces. The process works like this:
1. The contract owner saves the whitelist owner addresses with the `addToWhitelist` function before the sales process starts.
2. Whitelist sale starts date is **Monday, 3 April 2023 11:00:00**.
3. A wl address can mint up to 5 free NFTs with the `mintForWhitelist` function within the whitelist sale period.
4. Public sale start date and whitelist sale period end date is **Monday, 3 April 2023 17:00:00**.
5. After the whitelist sale period ends, the public sale begins.
6. In public sale, each NFT can be mint for 0.0015 ether.
7. An address can mint up to 20 NFTs with the `mintForPublic` function in public sale.
8. The contract holder can withdraw the contract balance at any time with the `withdraw` function.

