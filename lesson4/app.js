var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
// url ģ���� Node.js ��׼�������
// http://nodejs.org/api/url.html
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
  .end(function (err, res) {
    if (err) {
      return console.error(err);
    }
    var topicUrls = [];
    var $ = cheerio.load(res.text);
    // ��ȡ��ҳ���е�����
    $('#topic_list .topic_title').each(function (idx, element) {
      var $element = $(element);
      // $element.attr('href') ������������ /topic/542acd7d5d28233425538b04
      // ������ url.resolve ���Զ��ƶϳ����� url�����
      // https://cnodejs.org/topic/542acd7d5d28233425538b04 ����ʽ
      // �����뿴 http://nodejs.org/api/url.html#url_url_resolve_from_to ��ʾ��
      var href = url.resolve(cnodeUrl, $element.attr('href'));
      topicUrls.push(href);
    });

    console.log(topicUrls);

	// �õ� topicUrls ֮��

	// �õ�һ�� eventproxy ��ʵ��
	var ep = new eventproxy();

	// ���� ep �ظ����� topicUrls.length �Σ�������Ҳ���� 40 �Σ� `topic_html` �¼����ж�
	ep.after('topic_html', topicUrls.length, function (topics) {
	  // topics �Ǹ����飬������ 40 �� ep.emit('topic_html', pair) �е��� 40 �� pair

	  // ��ʼ�ж�
	  topics = topics.map(function (topicPair) {
		// ���������� jquery ���÷���
		var topicUrl = topicPair[0];
		var topicHtml = topicPair[1];
		var $ = cheerio.load(topicHtml);
		return ({
		  title: $('.topic_full_title').text().trim(),
		  href: topicUrl,
		  comment1: $('.reply_content').eq(0).text().trim(),
		});
	  });

	  console.log('final:');
	  console.log(topics);
	});

	topicUrls.forEach(function (topicUrl) {
	  superagent.get(topicUrl)
		.end(function (err, res) {
		  console.log('fetch ' + topicUrl + ' successful');
		  ep.emit('topic_html', [topicUrl, res.text]);
		});
	});
  });
