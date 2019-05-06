let cheerio = require("cheerio");

class Crawler {

    constructor(content) {
        this.content = content;
    }

    crawl() {
        var $ = cheerio.load(this.content);

        if(!($(".hwg .hw").first()[0])){
            console.log($(".searchHeading").first().text());
            console.log(req.query.define + " is not present in Dictionary.");
            res.header("Access-Control-Allow-Origin", "*");
            return res.status(404).sendFile(path.join(__dirname+'/views/404.html'));
        }
        
        
        var dictionary = [];

        var i,j = 0;

        var entryHead = $(".entryHead.primary_homograph");
        
        var array = [];
        var entriesOfFirstEntryHead = $("#" + entryHead[0].attribs.id + " ~ .gramb").length;
        for(i = 0; i < entryHead.length; i++){
            array[i]  =   entriesOfFirstEntryHead - $("#" + entryHead[i].attribs.id + " ~ .gramb").length;
        }
        array[i] = entriesOfFirstEntryHead;
        
        var grambs = $("section.gramb");

        var numberOfentryGroup = array.length - 1;

        for(i = 0; i < numberOfentryGroup; i++){
            var entry = {};
            var word  = $(".hwg .hw")[i].childNodes[0].nodeValue;
            entry.word = word;
            var phonetic  = $(".pronSection.etym .pron .phoneticspelling")[i];
            if(phonetic){
                entry.phonetic = phonetic.childNodes[0].data;
            }
            entry.pronunciations = $(".pronSection.etym .pron .pronunciations a audio").attr('src');

            entry.meaning = {};
            var start  = array[i];
            var end = array[i + 1];
            for(j = start; j < end; j++){
                    var partofspeech = $(grambs[j]).find(".ps.pos .pos").text();
                    $(grambs[j]).find(".semb").each(function(j, element){
                        var meaningArray = [];
                        $(element).find("> li").each(function(j, element){
                            
                            var item = $(element).find("> .trg");
                            
                            var definition = $(item).find(" > p > .ind").text();
                            if(definition.length  === 0){
                                definition = $(item).find(".crossReference").first().text();
                            }
                            var example = $(item).find(" > .exg  > .ex > em").first().text();
                            var synonymsText = $(item).find(" > .synonyms > .exg  > .exs").first().text();
                            var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym!= ' ' && synonym).map(function(item) {
                                             return item.trim();
                                           });
                                           
                            var newDefinition = {};
                            if(definition.length > 0)
                                newDefinition.definition = definition;
                                                                       
                            if(example.length > 0)
                                newDefinition.example = example.substring(1, example.length - 1);
                            
                            if(synonyms.length > 0)
                                newDefinition.synonyms = synonyms;
                            meaningArray.push(newDefinition);

                            $(item).find('> ol').find('li').each(function(i, elm){
                                if ($(elm).find('> span.ind').text().length) {
                                    var subSense = {};
                                    subSense.definition = $(elm).find('> span.ind').text();
                                    subSense.example = $(elm).find('> div.trg div.exg div.ex em').text();
                                    subSense.synonyms = $(elm).find('> div.trg div.synonyms div.exs').text().split(',');
                                    meaningArray.push(subSense);
                                }
                            })
                        });                           
                        if(partofspeech.length === 0)
                            partofspeech = "crossReference";
                            
                        entry.meaning[partofspeech] = meaningArray.slice();
                    });
                        
            }
            dictionary.push(entry);
        }
        return dictionary;
    }
}

module.exports = Crawler;