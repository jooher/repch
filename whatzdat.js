            extract(
                string.Format("http://market.yandex.ru/search.xml?how=aprice&np=1&text={0}",code),
                code,
                "yandex",
                null,

                yaroot+"*",
                yaroot+"*[@class='b-offers__bcrumbs']/a[last()]",
                 null,
                 null,
                yaroot+"*[contains(@class,'b-offers__name')]",
                yaroot+"p[@class='b-offers__spec']",
                null,
                yaroot+"*[contains(@class,'b-prices')][1]",
                null,
                string.Format("http://market.yandex.ru/search.xml?text={0}",code)
            ),
            extract(
                string.Format("http://goodsmatrix.ru/goods/{0}.html", code),
                code,
                "goodsmatrix",
                Encoding.GetEncoding("windows-1251"),

                "//*[@id='_ctl0_ContentPH_BarCodeL']",
                "//*[@id='_ctl0_ContentPH_GroupPath_GroupName']/*[last()]",
                 null,
                 null,
                "//*[@id='_ctl0_ContentPH_GoodsName']",
                "//*[@id='_ctl0_ContentPH_Comment']",
                "//*[@id='_ctl0_ContentPH_Mark_MarkL']",
                null,
                "//*[@id='_ctl0_GoodsMenuPH_GoodsMenu_AboutGoods']",
                null
            ),
            extract(
                "http://potrebiteli.ru/shop/bar-code/?q=" + code,
                code,
                "potrebiteli",
                null,

                "//*[@id='main-content-box']//*[@class='product-name']",
                "//*[@id='main-content-box']//*[@class='product-name']/a[1]",
                 null,
                 null,
                "//*[@id='main-content-box']//*[@class='product-name']/a[2]",
                "//*[@id='main-content-box']//*[@class='cont']",
                "//*[@id='main-content-box']//*[@class='a-box']/div[1]/@class",
                null,
                 "//*[@id='main-content-box']//*[@class='product-name']/a[2]/@href",
                 null
           ),
           uhttId == null ? null:
           extract(
                string.Format("https://uhtt.ru/UHTTDispatcher/?query=GETTDDO%20FRM_GOODS_DETAILS%20{0}",uhttId),
                code,
                "uhtt",
                null,

                "//*[@id='uhtt_frm_goods_details_barcode']",
                "//*[@id='uhtt_frm_goods_details_view']/table/tbody/tr/td[1]/table/tbody/tr[3]/td[2]",
                 null,
                 null,
                "//*[@id='uhtt_frm_goods_details_view']/table/tbody/tr/td[1]/table/tbody/tr[2]/td[2]",
                "//*[@id='uhtt_frm_goods_details_view']/table/tbody/tr/td[1]/table/tbody/tr[5]/td[2]",
                null,null,
                null,
                "https://uhtt.ru/"
            )

