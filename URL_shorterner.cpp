#include <iostream>
#include <string>
#include <unordered_map>

class URLService {
private:
    std::unordered_map<std::string, int> ltos;
    std::unordered_map<int, std::string> stol;
    static int COUNTER;
    std::string elements;

public:
    URLService() {
        ltos.clear();
        stol.clear();
        COUNTER = 1000000;
        elements = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    std::string longToShort(std::string url) {
        std::string shorturl = base10ToBase62(COUNTER);
        ltos[url] = COUNTER;
        stol[COUNTER] = url;
        COUNTER++;
        return "http://tiny.url/" + shorturl;
    }

    std::string shortToLong(std::string url) {
        std::string temp = "http://tiny.url/";
         int val = temp.length();
        url = url.substr(val);
        int n = base62ToBase10(url);
        return stol[n];
    }

    int base62ToBase10(std::string s) {
        int n = 0;
        for (size_t i = 0; i < s.length(); i++) {
            n = n * 62 + convert(s[i]);
        }
        return n;
    }

    int convert(char c) {
        if (c >= '0' && c <= '9')
            return c - '0';
        if (c >= 'a' && c <= 'z') {
            return c - 'a' + 10;
        }
        if (c >= 'A' && c <= 'Z') {
            return c - 'A' + 36;
        }
        return -1;
    }

    std::string base10ToBase62(int n) {
        std::string sb;
        while (n != 0) {
            sb.insert(0, 1, elements[n % 62]);
            n /= 62;
        }
        while (sb.length() != 7) {
            sb.insert(0, 1, '0');
        }
        return sb;
    }
};

int URLService::COUNTER = 1000000;

int main() {
    URLService urlService;
    std::string longUrl = "https://www.example.com";
    std::string shortUrl = urlService.longToShort(longUrl);
    std::cout << "Short URL: " << shortUrl << std::endl;
    std::string retrievedLongUrl = urlService.shortToLong(shortUrl);
    std::cout << "Retrieved Long URL: " << retrievedLongUrl << std::endl;

    return 0;
}