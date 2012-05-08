<%@ Import Namespace="System" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Net" %>
<%@ Import Namespace="System.Text" %>


<%@ Page Language="c#"%>

<script runat="server">
  public string ServerSideFunction()
  {
    // used to build entire input
            StringBuilder sb = new StringBuilder();

            // used on each read operation
            byte[] buf = new byte[8192];

            // prepare the web page we will be asking for
            HttpWebRequest request = (HttpWebRequest)
                //WebRequest.Create("http://port25.technet.com/rss.aspx");
				WebRequest.Create("http://blogs.technet.com/b/openness/rss.aspx");

            // execute the request
            HttpWebResponse response = (HttpWebResponse)
                request.GetResponse();

            // we will read data via the response stream
            Stream resStream = response.GetResponseStream();

            string tempString = null;
            int count = 0;

            do
            {
                // fill the buffer with data
                count = resStream.Read(buf, 0, buf.Length);

                // make sure we read some data
                if (count != 0)
                {
                    // translate from bytes to ASCII text
                    tempString = Encoding.UTF8.GetString(buf, 0, count);

                    // continue building the string
                    sb.Append(tempString);
                }
            }
            while (count > 0); // any more data to read?

            // print out page source
            string output = sb.ToString();
      
            //remove stylesheet so we dont get a cross-site call issue
            //find style sheet position 
            //<?xml-stylesheet type="text/xsl" href="http://port25.technet.com/utility/FeedStylesheets/rss.xsl" media="screen"?>
            int stylesheetStartPosition = output.IndexOf("<?xml-stylesheet");
      
            if (stylesheetStartPosition > 0)
            {
                int stylesheetFinishPosition = output.IndexOf("<rss", stylesheetStartPosition);
                output = output.Remove(stylesheetStartPosition, (stylesheetFinishPosition - stylesheetStartPosition));
            }
            
            
            return output;
  }
</script>
<% Response.ContentType = "text/xml";
   Response.Write(ServerSideFunction()); %>
